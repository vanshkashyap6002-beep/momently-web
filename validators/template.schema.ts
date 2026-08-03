import { z } from "zod";

/** GET /api/templates?category=&isPremium= — both filters optional. */
export const listTemplatesQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  isPremium: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});
export type ListTemplatesQuery = z.infer<typeof listTemplatesQuerySchema>;

export const templateSlugSchema = z.object({
  slug: z.string().trim().min(1, "slug is required"),
});

// ---- Admin Panel additions below — existing schemas above are untouched ----

export const createTemplateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  slug: z.string().trim().min(1, "Slug is required").max(120),
  category: z.string().trim().min(1, "Category is required"),
  thumbnail: z.string().trim().min(1, "Thumbnail URL is required"),
  description: z.string().trim().min(1, "Description is required"),
  isPremium: z.boolean().default(false),
  price: z.number().min(0).default(0),
  isEnabled: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

export const updateTemplateSchema = createTemplateSchema.partial();
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
