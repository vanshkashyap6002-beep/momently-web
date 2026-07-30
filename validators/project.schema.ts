import { z } from "zod";

export const themeSchema = z.object({
  colorScheme: z.enum(["deep-love", "midnight-gold", "blush-cream", "emerald-noir"]),
  font: z.enum(["playfair-inter", "cormorant-work", "fraunces-manrope"]),
  buttonStyle: z.enum(["solid", "outline", "pill-glow"]),
  animationStyle: z.enum(["gentle", "cinematic", "playful"]),
  background: z.enum(["paper", "gradient", "photo-blur"]),
});

/** Create Project — starts a fresh, empty DRAFT from a marketplace template. */
export const createProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  templateSlug: z.string().trim().min(1, "templateSlug is required"),
  coverImage: z.string().trim().min(1).nullable().optional(),
  theme: themeSchema.optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/** Update Project — partial patch of scalar fields; at least one required. */
export const updateProjectSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    coverImage: z.string().trim().min(1).nullable().optional(),
    theme: themeSchema.optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/** Save Draft / Publish — the Studio's content save. Keyed by an explicit
 * `projectId` (the Studio ensures a draft Project row exists before it
 * renders, via `projectService.getOrCreateStudioProject`) rather than
 * re-deriving one from a template slug. Media is no longer submitted here:
 * each upload/replace/delete/reorder persists immediately through its own
 * action/route (see `media.actions.ts`), so this only carries the Studio's
 * non-media fields. */
export const saveProjectContentSchema = z.object({
  projectId: z.string().trim().min(1, "projectId is required"),
  title: z.string().trim().min(1, "Title is required").max(120),
  coverImage: z.string().trim().min(1).nullable().optional(),
  theme: themeSchema,
});
export type SaveProjectContentInput = z.infer<typeof saveProjectContentSchema>;

export const projectIdSchema = z.object({
  id: z.string().trim().min(1, "Project id is required"),
});
