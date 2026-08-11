import { z } from "zod";

export const createDraftTemplateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  category: z.string().trim().min(1, "Category is required"),
  thumbnail: z.string().trim().url("Thumbnail must be a valid URL"),
  previewImages: z.array(z.string().trim().url()).max(6).default([]),
  description: z.string().trim().min(1, "Description is required").max(2000),
  isPremium: z.boolean().default(false),
  price: z.number().min(0).default(0),
});
export type CreateDraftTemplateInput = z.infer<typeof createDraftTemplateSchema>;

export const updateDraftTemplateSchema = createDraftTemplateSchema.partial();
export type UpdateDraftTemplateInput = z.infer<typeof updateDraftTemplateSchema>;

export const templateIdSchema = z.object({
  id: z.string().trim().min(1, "Template id is required"),
});

export const reviewDecisionSchema = z.object({
  id: z.string().trim().min(1, "Template id is required"),
  decision: z.enum(["APPROVED", "REJECTED", "NEEDS_CHANGES"]),
  note: z.string().trim().max(1000).optional(),
});
export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;
