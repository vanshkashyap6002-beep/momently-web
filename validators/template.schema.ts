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
