import { prisma } from "@/lib/prisma";
import type { Prisma, Report, ReportStatus } from "@prisma/client";

export const reportRepository = {
  create(data: Prisma.ReportCreateInput): Promise<Report> {
    return prisma.report.create({ data });
  },

  findAllForAdmin() {
    return prisma.report.findMany({
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        template: { select: { id: true, title: true, slug: true } },
        targetUser: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus(id: string, status: ReportStatus): Promise<Report> {
    return prisma.report.update({
      where: { id },
      data: { status, reviewedAt: new Date() },
    });
  },
};
