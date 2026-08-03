import { projectRepository, type ProjectWithMedia, type MediaItemInput } from "@/repositories/project.repository";
import { templateService } from "@/services/template.service";
import { paymentService } from "@/services/payment.service";
import { mediaStorage } from "@/lib/supabase-storage";
import { UPLOAD_CONSTRAINTS } from "@/validators/media.schema";
import { NotFoundError, PaymentRequiredError } from "@/lib/errors";
import { uniqueSlug } from "@/lib/slug";
import { encodeProjectTheme } from "@/lib/project-theme";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  SaveProjectContentInput,
} from "@/validators/project.schema";
import type { Prisma, ProjectStatus } from "@prisma/client";
import type { UploadKind } from "@/types/media";

/** The Studio always edits exactly one Project per (template, user) pair —
 * this is the single source of truth for that slug shape, shared by
 * `getOrCreateStudioProject` and `getStudioProject`. */
function studioProjectSlug(templateSlug: string, userId: string): string {
  return `${templateSlug}-${userId}`;
}

function assertOwnership(project: ProjectWithMedia | null, userId: string): ProjectWithMedia {
  if (!project || project.userId !== userId) {
    // Same 404 for "doesn't exist" and "exists but isn't yours" — an
    // unauthorized lookup can't be used to probe for other users' projects.
    throw new NotFoundError("Project not found.");
  }
  return project;
}

function buildUpdateData(
  input: Pick<UpdateProjectInput, "title" | "coverImage" | "theme"> & { status?: ProjectStatus }
): Prisma.ProjectUpdateInput {
  const data: Prisma.ProjectUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.coverImage !== undefined) data.coverImage = input.coverImage;
  if (input.status !== undefined) {
    data.status = input.status;
    data.publishedAt = input.status === "PUBLISHED" ? new Date() : null;
  }
  if (input.theme) Object.assign(data, encodeProjectTheme(input.theme));
  return data;
}

async function updateOwnedProject(
  userId: string,
  projectId: string,
  input: Pick<UpdateProjectInput, "title" | "coverImage" | "theme"> & { status?: ProjectStatus }
): Promise<ProjectWithMedia> {
  const existing = await projectRepository.findById(projectId);
  assertOwnership(existing, userId);
  return projectRepository.update(projectId, buildUpdateData(input));
}

/** Flips a project to PUBLISHED, gated on `paymentService.isProjectUnlocked` —
 * shared by the Studio's direct "Publish" flow (free templates) and the
 * Checkout page's post-payment confirmation step (premium templates,
 * content already saved before the payment redirect). */
async function publishOwnedProject(userId: string, projectId: string): Promise<ProjectWithMedia> {
  const existing = await projectRepository.findById(projectId);
  const owned = assertOwnership(existing, userId);

  const unlocked = await paymentService.isProjectUnlocked(owned.id, owned.templateId);
  if (!unlocked) throw new PaymentRequiredError();

  return projectRepository.update(projectId, { status: "PUBLISHED", publishedAt: new Date() });
}

export const projectService = {
  async createProject(userId: string, input: CreateProjectInput): Promise<ProjectWithMedia> {
    const templateId = await templateService.ensureTemplateFromMarketplaceSlug(input.templateSlug);
    const themeFields = input.theme ? encodeProjectTheme(input.theme) : {};

    return projectRepository.create({
      slug: uniqueSlug(input.title),
      title: input.title,
      coverImage: input.coverImage ?? null,
      ...themeFields,
      user: { connect: { id: userId } },
      template: { connect: { id: templateId } },
    });
  },

  updateProject(userId: string, projectId: string, input: UpdateProjectInput): Promise<ProjectWithMedia> {
    return updateOwnedProject(userId, projectId, input);
  },

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const existing = await projectRepository.findById(projectId);
    assertOwnership(existing, userId);
    await projectRepository.delete(projectId);
  },

  async getProject(userId: string, projectId: string): Promise<ProjectWithMedia> {
    const project = await projectRepository.findById(projectId);
    return assertOwnership(project, userId);
  },

  getProjects(userId: string): Promise<ProjectWithMedia[]> {
    return projectRepository.findManyByUserId(userId);
  },

  /** Read used by the Studio on load — unlike `getProject`, a missing
   * project here just means "nothing saved yet," not an error. Prefer
   * `getOrCreateStudioProject` for any flow (like uploads) that needs a
   * guaranteed project id to attach to. */
  getStudioProject(userId: string, templateSlug: string): Promise<ProjectWithMedia | null> {
    return projectRepository.findBySlug(studioProjectSlug(templateSlug, userId));
  },

  /**
   * Guarantees a DRAFT Project row exists for (templateSlug, userId) and
   * returns it — creating a minimal one on first visit. This is what makes
   * "upload a photo before ever clicking Save Draft" possible: the Studio
   * calls this once on load so every media upload always has a real
   * `projectId` to attach to, instead of uploads being stuck in
   * client-only state until the first manual save.
   */
  async getOrCreateStudioProject(
    userId: string,
    templateSlug: string,
    defaultTitle: string
  ): Promise<ProjectWithMedia> {
    const existing = await projectService.getStudioProject(userId, templateSlug);
    if (existing) return existing;

    const templateId = await templateService.ensureTemplateFromMarketplaceSlug(templateSlug);
    return projectRepository.create({
      slug: studioProjectSlug(templateSlug, userId),
      title: defaultTitle,
      user: { connect: { id: userId } },
      template: { connect: { id: templateId } },
    });
  },

  async duplicateProject(userId: string, projectId: string): Promise<ProjectWithMedia> {
    const source = await projectRepository.findById(projectId);
    const owned = assertOwnership(source, userId);

    // Re-upload each asset under a fresh publicId rather than sharing the
    // source's — otherwise deleting media on either copy would delete the
    // storage asset out from under the other. Done before the DB write
    // (and outside any transaction) since these are slow network calls,
    // not something that belongs inside a database transaction.
    const duplicatedMedia: MediaItemInput[] = await Promise.all(
      owned.media.map(async (m) => {
        const kind = m.type as UploadKind;
        const constraint = UPLOAD_CONSTRAINTS[kind];
        const duplicated = await mediaStorage.duplicate(m.url, constraint.storageFolder, constraint.resourceType);
        return {
          type: m.type,
          url: duplicated.url,
          publicId: duplicated.publicId,
          filename: m.filename,
          fileSize: duplicated.bytes,
          mimeType: m.mimeType,
          order: m.order,
        };
      })
    );

    return projectRepository.createWithMedia(
      {
        slug: uniqueSlug(`${owned.title} copy`),
        title: `${owned.title} (Copy)`,
        coverImage: owned.coverImage,
        theme: owned.theme,
        font: owned.font,
        primaryColor: owned.primaryColor,
        secondaryColor: owned.secondaryColor,
        status: "DRAFT",
        publishedAt: null,
        user: { connect: { id: userId } },
        template: { connect: { id: owned.templateId } },
      },
      duplicatedMedia
    );
  },

  /** Wired to the Studio's "Save Draft" button. */
  saveDraft(userId: string, input: SaveProjectContentInput): Promise<ProjectWithMedia> {
    return updateOwnedProject(userId, input.projectId, { ...input, status: "DRAFT" });
  },

  /** Wired to the Studio's "Publish" button. Always saves the latest
   * content first (so it's safely persisted as DRAFT even if the payment
   * gate blocks publishing), then attempts to flip to PUBLISHED — blocked
   * by `PaymentRequiredError` (402) until a successful Payment exists for
   * projects built from a premium (non-zero-price) Template. Free
   * templates publish immediately. */
  async publishProject(userId: string, input: SaveProjectContentInput): Promise<ProjectWithMedia> {
    await updateOwnedProject(userId, input.projectId, {
      title: input.title,
      coverImage: input.coverImage,
      theme: input.theme,
    });
    return publishOwnedProject(userId, input.projectId);
  },

  /** Completes publishing after a successful payment, on the Checkout
   * page — content was already saved by `publishProject` before the
   * redirect, so this only needs to flip the status. */
  publishExistingProject(userId: string, projectId: string): Promise<ProjectWithMedia> {
    return publishOwnedProject(userId, projectId);
  },

  unpublishProject(userId: string, projectId: string): Promise<ProjectWithMedia> {
    return updateOwnedProject(userId, projectId, { status: "DRAFT" });
  },

  // ---- Admin Panel additions below — existing methods above are untouched ----

  /** No ownership check — only ever called from an admin.actions.ts entry
   * point already gated by requireAdminUserId(), so any project is fair
   * game for the Admin Panel's project list/moderation view. */
  getAllProjectsForAdmin() {
    return projectRepository.findAllForAdmin();
  },

  async deleteProjectAsAdmin(projectId: string): Promise<void> {
    const existing = await projectRepository.findById(projectId);
    if (!existing) throw new NotFoundError("Project not found.");
    await projectRepository.delete(projectId);
  },
};
