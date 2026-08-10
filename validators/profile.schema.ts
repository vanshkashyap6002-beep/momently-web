import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z.string().trim().max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  isPublic: z.boolean().optional(),
  birthday: z.string().trim().optional(), // ISO date string from <input type="date">
  anniversary: z.string().trim().optional(),
  partnerName: z.string().trim().max(80).optional(),
  preferences: z.record(z.unknown()).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
