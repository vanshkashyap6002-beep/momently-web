import { z } from "zod";

export const userIdSchema = z.object({
  id: z.string().trim().min(1, "User id is required"),
});

export const changeRoleSchema = z.object({
  userId: z.string().trim().min(1, "User id is required"),
  role: z.enum(["USER", "ADMIN"]),
});
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

export const setSuspendedSchema = z.object({
  userId: z.string().trim().min(1, "User id is required"),
  isSuspended: z.boolean(),
});
export type SetSuspendedInput = z.infer<typeof setSuspendedSchema>;

export const updateSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required").max(80).optional(),
  maintenanceMode: z.boolean().optional(),
});
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
