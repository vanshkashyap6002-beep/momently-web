import { templateRepository } from "@/repositories/template.repository";
import { scanTemplateSubmission } from "@/lib/content-scanner";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type {
  CreateDraftTemplateInput,
  UpdateDraftTemplateInput,
  ReviewDecisionInput,
} from "@/validators/community-template.schema";
import type { Template, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";

function slugFor(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return `${base || "template"}-${randomUUID().slice(0, 8)}`;
}

/** Only the creator who owns a draft may see/edit it, and only while it's
 * still editable (DRAFT, or NEEDS_CHANGES so they can revise and
 * resubmit) — everything else (PENDING_REVIEW, APPROVED, REJECTED) is
 * locked from further creator edits. */
function assertEditable(template: Template) {
  if (template.reviewStatus !== "DRAFT" && template.reviewStatus !== "NEEDS_CHANGES") {
    throw new ValidationError(
      "This template can't be edited right now — it's already submitted or has been reviewed."
    );
  }
}

export const communityTemplateService = {
  async createDraft(creatorId: string, input: CreateDraftTemplateInput): Promise<Template> {
    return templateRepository.create({
      title: input.title,
      slug: slugFor(input.title),
      category: input.category,
      thumbnail: input.thumbnail,
      previewImages: input.previewImages,
      description: input.description,
      isPremium: input.isPremium,
      price: input.price,
      isEnabled: false, // never visible until an admin approves it
      isFeatured: false,
      reviewStatus: "DRAFT",
      creator: { connect: { id: creatorId } },
    });
  },

  getMyTemplates(creatorId: string): Promise<Template[]> {
    return templateRepository.findManyByCreator(creatorId);
  },

  async getMyTemplate(creatorId: string, id: string): Promise<Template> {
    const template = await templateRepository.findByIdAndCreator(id, creatorId);
    if (!template) throw new NotFoundError("Template not found.");
    return template;
  },

  async updateDraft(creatorId: string, id: string, input: UpdateDraftTemplateInput): Promise<Template> {
    const template = await templateRepository.findByIdAndCreator(id, creatorId);
    if (!template) throw new NotFoundError("Template not found.");
    assertEditable(template);

    return templateRepository.update(id, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
      ...(input.previewImages !== undefined ? { previewImages: input.previewImages } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.isPremium !== undefined ? { isPremium: input.isPremium } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      // Resubmitting after NEEDS_CHANGES starts a fresh review cycle.
      reviewStatus: "DRAFT",
      reviewNote: null,
    });
  },

  async deleteDraft(creatorId: string, id: string): Promise<void> {
    const template = await templateRepository.findByIdAndCreator(id, creatorId);
    if (!template) throw new NotFoundError("Template not found.");
    assertEditable(template);
    await templateRepository.delete(id);
  },

  /** Runs the automated pre-screen and moves the draft into the admin
   * queue. The scan result is stored for the admin to see, never used to
   * silently reject — matching "flag suspicious submissions, let admin
   * decide" from the brief. */
  async submitForReview(creatorId: string, id: string): Promise<Template> {
    const template = await templateRepository.findByIdAndCreator(id, creatorId);
    if (!template) throw new NotFoundError("Template not found.");
    assertEditable(template);

    const scan = scanTemplateSubmission({
      title: template.title,
      description: template.description,
      thumbnail: template.thumbnail,
      previewImages: template.previewImages,
    });

    return templateRepository.update(id, {
      reviewStatus: "PENDING_REVIEW",
      submittedAt: new Date(),
      autoFlags: scan.flags as unknown as Prisma.InputJsonValue,
    });
  },

  // ---- Admin review ----

  getPendingReview() {
    return templateRepository.findPendingReview();
  },

  async reviewTemplate(adminId: string, input: ReviewDecisionInput): Promise<Template> {
    const template = await templateRepository.findById(input.id);
    if (!template) throw new NotFoundError("Template not found.");
    if (template.reviewStatus !== "PENDING_REVIEW") {
      throw new ValidationError("This template isn't currently pending review.");
    }

    return templateRepository.update(input.id, {
      reviewStatus: input.decision,
      reviewedAt: new Date(),
      reviewedBy: adminId,
      reviewNote: input.note ?? null,
      // Only an APPROVED community template becomes visible anywhere a
      // Template is listed (Marketplace API, etc.) — same isEnabled flag
      // the Admin Panel already uses for admin-authored templates.
      isEnabled: input.decision === "APPROVED",
    });
  },
};
