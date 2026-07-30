import { randomUUID } from "crypto";

/** Lowercases, strips non-alphanumerics to hyphens, trims edge hyphens. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return base || "untitled";
}

/** A slug plus a short random suffix — avoids a find-then-retry loop for
 * uniqueness at the cost of a negligible collision probability. */
export function uniqueSlug(input: string): string {
  return `${slugify(input)}-${randomUUID().slice(0, 8)}`;
}
