import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  // Service role key: server-only, bypasses Row Level Security — required
  // for the app's own backend to write/delete on users' behalf. Never
  // expose this key to the client (it's not the NEXT_PUBLIC_ key).
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  { auth: { persistSession: false } }
);

const BUCKET = "momently-media";

// Kept identical to the previous Cloudinary-based type so nothing else in
// the app needs to change — Supabase doesn't have a "resource type"
// concept, this is just carried through untouched for interface parity.
export type StorageResourceType = "image" | "video" | "raw";

export interface StorageUploadInput {
  buffer: Buffer;
  folder: string;
  resourceType: StorageResourceType;
  /** The original filename (WITH extension) — used to build the storage
   * object key and to infer a content type. Unlike the old Cloudinary
   * provider, Supabase needs the real extension since it has no separate
   * "public_id vs. detected format" concept; the key you upload to is the
   * key you get back. */
  filenameHint?: string;
}

export interface StorageUploadResult {
  url: string;
  /** The Supabase Storage object path (e.g. "images/<uuid>.jpg") — this is
   * what `Media.publicId` stores, and what `remove()`/`duplicate()` take
   * as their identifier, exactly as the old Cloudinary public_id did. */
  publicId: string;
  bytes: number;
}

/**
 * Storage abstraction: every media kind (image/video/music) goes through
 * this interface rather than calling the Supabase SDK directly from the
 * service layer. Swapping providers later (S3, R2, local disk for tests)
 * means implementing `MediaStorage` once and changing the single export
 * below — no changes to `services/media.service.ts` or anything upstream.
 */
export interface MediaStorage {
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  remove(publicId: string, resourceType: StorageResourceType): Promise<void>;
  /** Downloads the existing file and re-uploads it under a brand-new
   * object key, so every project gets its own independent copy. Sharing
   * an object key between two projects would mean deleting one's media
   * could delete the other's underlying file out from under it. */
  duplicate(sourceUrl: string, folder: string, resourceType: StorageResourceType): Promise<StorageUploadResult>;
}

function extensionOf(filename: string | undefined): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : "";
}

function contentTypeFor(resourceType: StorageResourceType, extension: string): string {
  const ext = extension.replace(".", "");
  if (resourceType === "image") return `image/${ext || "jpeg"}`;
  if (resourceType === "video") return ext === "mp3" || ext === "wav" ? `audio/${ext}` : `video/${ext || "mp4"}`;
  return "application/octet-stream";
}

function buildObjectKey(folder: string, extension: string): string {
  return `${folder}/${randomUUID()}${extension}`;
}

function publicUrlFor(objectKey: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectKey);
  return data.publicUrl;
}

const supabaseStorage: MediaStorage = {
  async upload({ buffer, folder, resourceType, filenameHint }) {
    const extension = extensionOf(filenameHint);
    const objectKey = buildObjectKey(folder, extension);

    const { error } = await supabase.storage.from(BUCKET).upload(objectKey, buffer, {
      contentType: contentTypeFor(resourceType, extension),
      upsert: false,
    });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    return { url: publicUrlFor(objectKey), publicId: objectKey, bytes: buffer.byteLength };
  },

  async remove(publicId) {
    const { error } = await supabase.storage.from(BUCKET).remove([publicId]);
    if (error) {
      throw new Error(`Supabase Storage remove failed: ${error.message}`);
    }
  },

  async duplicate(sourceUrl, folder, resourceType) {
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to download source file for duplication: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    const extension = extensionOf(new URL(sourceUrl).pathname);
    const objectKey = buildObjectKey(folder, extension);

    const { error } = await supabase.storage.from(BUCKET).upload(objectKey, buffer, {
      contentType: contentTypeFor(resourceType, extension),
      upsert: false,
    });

    if (error) {
      throw new Error(`Supabase Storage duplicate upload failed: ${error.message}`);
    }

    return { url: publicUrlFor(objectKey), publicId: objectKey, bytes: buffer.byteLength };
  },
};

/** The active storage provider. */
export const mediaStorage: MediaStorage = supabaseStorage;

export const STORAGE_FOLDERS = {
  IMAGE: "images",
  VIDEO: "videos",
  MUSIC: "audio",
} as const;
