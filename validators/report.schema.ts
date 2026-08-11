import { z } from "zod";

export const createReportSchema = z
  .object({
    targetType: z.enum(["TEMPLATE", "CREATOR"]),
    reason: z.enum(["SPAM", "COPYRIGHT", "ADULT_CONTENT", "SCAM", "MALICIOUS_LINKS", "OTHER"]),
    details: z.string().trim().max(1000).optional(),
    templateId: z.string().trim().min(1).optional(),
    targetUserId: z.string().trim().min(1).optional(),
  })
  .refine((data) => (data.targetType === "TEMPLATE" ? Boolean(data.templateId) : Boolean(data.targetUserId)), {
    message: "Missing the id of what's being reported.",
  });
export type CreateReportInput = z.infer<typeof createReportSchema>;

export const updateReportStatusSchema = z.object({
  id: z.string().trim().min(1, "Report id is required"),
  status: z.enum(["OPEN", "REVIEWED", "DISMISSED"]),
});
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
