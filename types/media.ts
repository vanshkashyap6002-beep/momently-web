import type { Media, MediaType } from "@prisma/client";
import type { StorageResourceType } from "@/lib/supabase-storage";

/** The three upload kinds the frontend actually offers — a narrower alias
 * of Prisma's `MediaType` used at the validation/action boundary so upload
 * call sites read as "IMAGE" | "VIDEO" | "MUSIC" without importing Prisma
 * types into client-safe code. */
export type UploadKind = Extract<MediaType, "IMAGE" | "VIDEO" | "MUSIC">;

export interface UploadConstraint {
  maxBytes: number;
  extensions: string[];
  storageFolder: string;
  resourceType: StorageResourceType;
}

export interface ReorderItem {
  id: string;
  order: number;
}

export type MediaDTO = Media;
