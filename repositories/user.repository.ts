import { prisma } from "@/lib/prisma";
import type { Prisma, User, Role } from "@prisma/client";

export type UserSummary = Omit<User, "password">;

const withoutPassword = {
  id: true,
  fullName: true,
  email: true,
  emailVerified: true,
  avatar: true,
  role: true,
  isSuspended: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const userRepository = {
  findManyForAdmin(): Promise<UserSummary[]> {
    return prisma.user.findMany({ select: withoutPassword, orderBy: { createdAt: "desc" } });
  },

  findByIdForAdmin(id: string): Promise<UserSummary | null> {
    return prisma.user.findUnique({ where: { id }, select: withoutPassword });
  },

  /** Counts + per-user spend, used by the Users table's "Projects",
   * "Orders", and "Amount Spent" columns — one query instead of N+1s. */
  async getStatsByUserId(userId: string): Promise<{ projectCount: number; paymentCount: number; amountSpent: number }> {
    const [projectCount, paymentCount, spendResult] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.payment.count({ where: { userId } }),
      prisma.payment.aggregate({ where: { userId, status: "SUCCESS" }, _sum: { amount: true } }),
    ]);
    return {
      projectCount,
      paymentCount,
      amountSpent: Number(spendResult._sum.amount ?? 0),
    };
  },

  updateRole(id: string, role: Role): Promise<UserSummary> {
    return prisma.user.update({ where: { id }, data: { role }, select: withoutPassword });
  },

  setSuspended(id: string, isSuspended: boolean): Promise<UserSummary> {
    return prisma.user.update({ where: { id }, data: { isSuspended }, select: withoutPassword });
  },

  delete(id: string): Promise<void> {
    return prisma.user.delete({ where: { id } }).then(() => undefined);
  },

  countTotal(): Promise<number> {
    return prisma.user.count();
  },

  /** "Active" = signed in at least once in the last 30 days. */
  countActiveSince(since: Date): Promise<number> {
    return prisma.user.count({ where: { lastLoginAt: { gte: since } } });
  },
};
