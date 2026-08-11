import { reportRepository } from "@/repositories/report.repository";
import { checkRateLimit } from "@/lib/rate-limit";
import { RateLimitError } from "@/lib/errors";
import type { CreateReportInput } from "@/validators/report.schema";
import type { Report, ReportStatus } from "@prisma/client";

export const reportService = {
  async createReport(reporterId: string, input: CreateReportInput): Promise<Report> {
    // 10 reports per hour per user — reports are a moderation signal, not
    // a spam vector, but still worth capping against abuse (e.g. mass-
    // reporting a rival creator).
    const limit = await checkRateLimit(`report:${reporterId}`, 10, 60 * 60);
    if (!limit.allowed) {
      throw new RateLimitError("Too many reports submitted. Please try again later.");
    }

    return reportRepository.create({
      targetType: input.targetType,
      reason: input.reason,
      details: input.details ?? null,
      reporter: { connect: { id: reporterId } },
      ...(input.templateId ? { template: { connect: { id: input.templateId } } } : {}),
      ...(input.targetUserId ? { targetUser: { connect: { id: input.targetUserId } } } : {}),
    });
  },

  getAllReportsForAdmin() {
    return reportRepository.findAllForAdmin();
  },

  updateReportStatus(id: string, status: ReportStatus): Promise<Report> {
    return reportRepository.updateStatus(id, status);
  },
};
