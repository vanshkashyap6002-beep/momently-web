"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/session";
import { parseOrThrow } from "@/lib/validation";
import { toActionResult } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { mediaService } from "@/services/media.service";
import { mediaFileSchema, projectIdFieldSchema, reorderMediaSchema } from "@/validators/media.schema";
import type { Media } from "@prisma/client";
import type { ActionResult } from "@/types/api";
import type { ReorderItem } from "@/types/media";

function extractFile(formData: FormData): File {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new ValidationError("No file was provided.");
  return file;
}

function extractProjectId(formData: FormData): string {
  const { projectId } = parseOrThrow(projectIdFieldSchema, {
    projectId: formData.get("projectId"),
  });
  return projectId;
}

export async function uploadImage(formData: FormData): Promise<ActionResult<Media>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const projectId = extractProjectId(formData);
    const file = parseOrThrow(mediaFileSchema("IMAGE"), extractFile(formData));
    const media = await mediaService.uploadImage(userId, projectId, file);
    revalidatePath(`/customize`);
    return media;
  });
}

export async function uploadVideo(formData: FormData): Promise<ActionResult<Media>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const projectId = extractProjectId(formData);
    const file = parseOrThrow(mediaFileSchema("VIDEO"), extractFile(formData));
    const media = await mediaService.uploadVideo(userId, projectId, file);
    revalidatePath(`/customize`);
    return media;
  });
}

export async function uploadMusic(formData: FormData): Promise<ActionResult<Media>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const projectId = extractProjectId(formData);
    const file = parseOrThrow(mediaFileSchema("MUSIC"), extractFile(formData));
    const media = await mediaService.uploadMusic(userId, projectId, file);
    revalidatePath(`/customize`);
    return media;
  });
}

/** Shared by every kind — the existing Media row's `type` determines which
 * constraint (size/extension) the replacement file is validated against. */
export async function replaceMedia(mediaId: string, formData: FormData): Promise<ActionResult<Media>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const file = extractFile(formData);
    const media = await mediaService.replaceMedia(userId, mediaId, file);
    revalidatePath(`/customize`);
    return media;
  });
}

export async function deleteMedia(mediaId: string): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await mediaService.deleteMedia(userId, mediaId);
    revalidatePath(`/customize`);
    return { id: mediaId };
  });
}

export async function reorderMedia(projectId: string, items: ReorderItem[]): Promise<ActionResult<{ ok: true }>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(reorderMediaSchema, { projectId, items });
    await mediaService.reorderMedia(userId, parsed.projectId, parsed.items);
    revalidatePath(`/customize`);
    return { ok: true as const };
  });
}
