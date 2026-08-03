import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  successfulPayments: number;
  failedPayments: number;
  publishedProjects: number;
  draftProjects: number;
}

export interface RevenuePoint {
  month: string; // "2025-01"
  revenue: number;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
}

export interface BestSellingTemplate {
  templateId: string;
  title: string;
  salesCount: number;
  revenue: number;
}

const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

export const adminRepository = {
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      revenueResult,
      pendingOrders,
      successfulPayments,
      failedPayments,
      publishedProjects,
      draftProjects,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo() } } }),
      prisma.payment.count(),
      prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "SUCCESS" } }),
      prisma.payment.count({ where: { status: "FAILED" } }),
      prisma.project.count({ where: { status: "PUBLISHED" } }),
      prisma.project.count({ where: { status: "DRAFT" } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalOrders,
      totalRevenue: Number(revenueResult._sum.amount ?? 0),
      pendingOrders,
      successfulPayments,
      failedPayments,
      publishedProjects,
      draftProjects,
    };
  },

  /** Last 6 months of successful-payment revenue, grouped by month.
   * Small enough dataset (admin analytics, not a hot path) that grouping
   * in application code is simpler and clearer than a raw SQL date_trunc. */
  async getMonthlyRevenue(months = 6): Promise<RevenuePoint[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const payments = await prisma.payment.findMany({
      where: { status: "SUCCESS", createdAt: { gte: since } },
      select: { amount: true, createdAt: true },
    });

    return buildMonthlyBuckets(months, (bucket) => {
      const total = payments
        .filter((p) => monthKey(p.createdAt) === bucket)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      return { month: bucket, revenue: total };
    });
  },

  async getMonthlyUserGrowth(months = 6): Promise<UserGrowthPoint[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - (months - 1));
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });

    return buildMonthlyBuckets(months, (bucket) => ({
      month: bucket,
      users: users.filter((u) => monthKey(u.createdAt) === bucket).length,
    }));
  },

  async getBestSellingTemplates(limit = 5): Promise<BestSellingTemplate[]> {
    const grouped = await prisma.payment.groupBy({
      by: ["projectId"],
      where: { status: "SUCCESS" },
      _sum: { amount: true },
      _count: { _all: true },
    });

    const projectIds = grouped.map((g) => g.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, templateId: true, template: { select: { title: true } } },
    });

    const byTemplate = new Map<string, BestSellingTemplate>();
    for (const group of grouped) {
      const project = projects.find((p) => p.id === group.projectId);
      if (!project) continue;
      const existing = byTemplate.get(project.templateId);
      const revenue = Number(group._sum.amount ?? 0);
      if (existing) {
        existing.salesCount += group._count._all;
        existing.revenue += revenue;
      } else {
        byTemplate.set(project.templateId, {
          templateId: project.templateId,
          title: project.template.title,
          salesCount: group._count._all,
          revenue,
        });
      }
    }

    return Array.from(byTemplate.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  },
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function buildMonthlyBuckets<T>(months: number, build: (bucket: string) => T): T[] {
  const points: T[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  cursor.setMonth(cursor.getMonth() - (months - 1));

  for (let i = 0; i < months; i++) {
    points.push(build(monthKey(cursor)));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return points;
}
