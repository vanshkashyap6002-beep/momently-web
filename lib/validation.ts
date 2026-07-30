import type { ZodType, ZodTypeDef } from "zod";
import { ValidationError } from "@/lib/errors";

/**
 * Parses `data` against `schema`, throwing a `ValidationError` (400, with
 * per-field messages) on failure instead of returning a Zod result object —
 * keeps calling code a single happy-path line instead of a branch on every
 * validated input.
 *
 * Typed as `ZodType<T, ZodTypeDef, unknown>` rather than the `ZodSchema<T>`
 * alias: `ZodSchema<T>` pins the schema's Input type to equal T too, which
 * breaks inference for any schema using `.default()`/`.transform()` (where
 * Input and Output legitimately differ) — T would silently infer as the
 * pre-transform Input shape instead of the actual parsed Output shape.
 */
export function parseOrThrow<T>(schema: ZodType<T, ZodTypeDef, unknown>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[]>;
    throw new ValidationError("Please check the highlighted fields.", fieldErrors);
  }
  return result.data;
}
