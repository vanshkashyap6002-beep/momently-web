import { mediaRepository } from "@/repositories/media.repository";
import { projectRepository } from "@/repositories/project.repository";
import { mediaStorage } from "@/lib/supabase-storage";
import { UPLOAD_CONSTRAINTS } from "@/validators/media.schema";
import { NotFoundError } from "@/lib/errors";
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
  await assertProjectOwnership(projectId, userId);
  const constraint = UPLOAD_CONSTRAINTS[kind];

  const buffer = Buffer.from(await file.arrayBuffer());
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
    mimeType: file.type,
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
      mimeType: file.type,
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
