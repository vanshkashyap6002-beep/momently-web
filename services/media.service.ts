import { mediaRepository } from "@/repositories/media.repository";
import { projectRepository } from "@/repositories/project.repository";
import { mediaStorage } from "@/lib/supabase-storage";
import { UPLOAD_CONSTRAINTS } from "@/validators/media.schema";
import { NotFoundError, RateLimitError, ValidationError } from "@/lib/errors";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyFileSignature } from "@/lib/file-signature";
import type { UploadKind, ReorderItem } from "@/types/media";
import type { Media } from "@prisma/client";

async function assertProjectOwnership(projectId: string, userId: string) {
  const project = await projectRepository.findById(projectId);
  if (!project || project.userId !== userId) {
    // Same 404-for-both approach as the project service: don't reveal
    // whether a project exists at all to a non-owner.
    throw new NotFoundError("Project not found.");
  }
  return project;
}

async function assertMediaOwnership(mediaId: string, userId: string): Promise<Media> {
  const media = await mediaRepository.findById(mediaId);
  if (!media) throw new NotFoundError("Media not found.");
  await assertProjectOwnership(media.projectId, userId);
  return media;
}

async function uploadMediaOfKind(
  userId: string,
  projectId: string,
  file: File,
  kind: UploadKind
): Promise<Media> {
  const limit = await checkRateLimit(`media-upload:${userId}`, 30, 5 * 60);
  if (!limit.allowed) {
    throw new RateLimitError("Too many uploads in a short time. Please wait a few minutes and try again.");
  }

  await assertProjectOwnership(projectId, userId);
  const constraint = UPLOAD_CONSTRAINTS[kind];

  const buffer = Buffer.from(await file.arrayBuffer());

  // The file's REAL bytes must match one of this kind's allowed formats —
  // filename extension and browser-supplied Content-Type (checked above,
  // in validators/media.schema.ts) are both trivially spoofable and were,
  // before this fix, the only checks performed. Audit finding H1.
  const detected = verifyFileSignature(buffer, constraint.extensions);
  if (!detected) {
    throw new ValidationError(
      `That file doesn't look like a valid ${constraint.extensions.join("/")} file. Please choose a different file.`
    );
  }

  const uploaded = await mediaStorage.upload({
    buffer,
    folder: constraint.storageFolder,
    resourceType: constraint.resourceType,
    filenameHint: file.name,
  });

  const order = await mediaRepository.getNextOrder(projectId, kind);

  return mediaRepository.create({
    type: kind,
    url: uploaded.url,
    publicId: uploaded.publicId,
    filename: file.name,
    fileSize: file.size,
    // The sniffed type from the real file content, not the client-supplied
    // file.type — the two could otherwise disagree (audit finding M1).
    mimeType: detected.mimeType,
    order,
    project: { connect: { id: projectId } },
  });
}

export const mediaService = {
  uploadImage(userId: string, projectId: string, file: File): Promise<Media> {
    return uploadMediaOfKind(userId, projectId, file, "IMAGE");
  },

  uploadVideo(userId: string, projectId: string, file: File): Promise<Media> {
    return uploadMediaOfKind(userId, projectId, file, "VIDEO");
  },

  uploadMusic(userId: string, projectId: string, file: File): Promise<Media> {
    return uploadMediaOfKind(userId, projectId, file, "MUSIC");
  },

  async deleteMedia(userId: string, mediaId: string): Promise<void> {
    const media = await assertMediaOwnership(mediaId, userId);

    if (media.publicId) {
      const constraint = UPLOAD_CONSTRAINTS[media.type as UploadKind];
      await mediaStorage.remove(media.publicId, constraint.resourceType).catch((err) => {
        // A storage-provider hiccup shouldn't block deleting the DB row —
        // an orphaned remote asset is recoverable via a cleanup script;
        // a media row the user can never remove is a worse experience.
        console.error(`Failed to delete storage asset ${media.publicId}:`, err);
      });
    }

    await mediaRepository.delete(mediaId);
  },

  async replaceMedia(userId: string, mediaId: string, file: File): Promise<Media> {
    const existing = await assertMediaOwnership(mediaId, userId);
    const constraint = UPLOAD_CONSTRAINTS[existing.type as UploadKind];

    const buffer = Buffer.from(await file.arrayBuffer());

    const detected = verifyFileSignature(buffer, constraint.extensions);
    if (!detected) {
      throw new ValidationError(
        `That file doesn't look like a valid ${constraint.extensions.join("/")} file. Please choose a different file.`
      );
    }

    const uploaded = await mediaStorage.upload({
      buffer,
      folder: constraint.storageFolder,
      resourceType: constraint.resourceType,
      filenameHint: file.name,
    });

    if (existing.publicId) {
      await mediaStorage.remove(existing.publicId, constraint.resourceType).catch((err) => {
        console.error(`Failed to delete replaced storage asset ${existing.publicId}:`, err);
      });
    }

    return mediaRepository.update(mediaId, {
      url: uploaded.url,
      publicId: uploaded.publicId,
      filename: file.name,
      fileSize: file.size,
      mimeType: detected.mimeType,
    });
  },

  async reorderMedia(userId: string, projectId: string, items: ReorderItem[]): Promise<void> {
    await assertProjectOwnership(projectId, userId);

    const existingMedia = await mediaRepository.findManyByProjectId(projectId);
    const existingIds = new Set(existingMedia.map((m) => m.id));
    const allBelongToProject = items.every((item) => existingIds.has(item.id));
    if (!allBelongToProject) {
      throw new NotFoundError("One or more media items do not belong to this project.");
    }

    await mediaRepository.reorderMany(items);
  },
};
