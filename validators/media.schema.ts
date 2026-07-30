import { z } from "zod";
import type { UploadConstraint, UploadKind } from "@/types/media";
import { STORAGE_FOLDERS } from "@/lib/supabase-storage";

const MB = 1024 * 1024;

/** Single source of truth for size/extension/storage rules per upload
 * kind — referenced by validators, services, and route handlers alike so
 * the limits from the spec exist in exactly one place. */
export const UPLOAD_CONSTRAINTS: Record<UploadKind, UploadConstraint> = {
  IMAGE: {
    maxBytes: 10 * MB,
    extensions: ["jpg", "jpeg", "png", "webp"],
    storageFolder: STORAGE_FOLDERS.IMAGE,
    resourceType: "image",
  },
  VIDEO: {
    maxBytes: 100 * MB,
    extensions: ["mp4", "mov", "webm"],
    storageFolder: STORAGE_FOLDERS.VIDEO,
    resourceType: "video",
  },
  MUSIC: {
    maxBytes: 20 * MB,
    extensions: ["mp3", "wav"],
    storageFolder: STORAGE_FOLDERS.MUSIC,
    resourceType: "video", // maps to an audio/* content type in lib/supabase-storage.ts
  },
};

function extensionOf(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

/** Builds a Zod schema validating a single uploaded `File` against a given
 * kind's size/extension rules — shared by image/video/music so the three
 * near-identical checks aren't duplicated three times. */
export function mediaFileSchema(kind: UploadKind) {
  const constraint = UPLOAD_CONSTRAINTS[kind];
  return z
    .instanceof(File, { message: "No file was provided." })
    .refine((file) => file.size > 0, { message: "The uploaded file is empty." })
    .refine((file) => file.size <= constraint.maxBytes, {
      message: `File exceeds the maximum size of ${Math.round(constraint.maxBytes / MB)}MB.`,
    })
    .refine((file) => constraint.extensions.includes(extensionOf(file.name)), {
      message: `Unsupported file type. Allowed: ${constraint.extensions.join(", ")}.`,
    });
}

export const projectIdFieldSchema = z.object({
  projectId: z.string().trim().min(1, "projectId is required"),
});

export const mediaIdSchema = z.object({
  id: z.string().trim().min(1, "Media id is required"),
});

export const reorderMediaSchema = z.object({
  projectId: z.string().trim().min(1, "projectId is required"),
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        order: z.number().int().nonnegative(),
      })
    )
    .min(1, "At least one item is required to reorder."),
});
export type ReorderMediaInput = z.infer<typeof reorderMediaSchema>;
