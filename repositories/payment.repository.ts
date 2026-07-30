import { prisma } from "@/lib/prisma";
import type { Prisma, Payment } from "@prisma/client";

type Db = typeof prisma | Prisma.TransactionClient;

export const paymentRepository = {
  create(data: Prisma.PaymentCreateInput, db: Db = prisma): Promise<Payment> {
    return db.payment.create({ data });
  },

  findByRazorpayOrderId(razorpayOrderId: string, db: Db = prisma): Promise<Payment | null> {
    return db.payment.findUnique({ where: { razorpayOrderId } });
  },

  findLatestSuccessByProjectId(projectId: string, db: Db = prisma): Promise<Payment | null> {
    return db.payment.findFirst({
      where: { projectId, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });
  },

  findManyByProjectId(projectId: string, db: Db = prisma): Promise<Payment[]> {
    return db.payment.findMany({ where: { projectId }, orderBy: { createdAt: "desc" } });
  },

  update(id: string, data: Prisma.PaymentUpdateInput, db: Db = prisma): Promise<Payment> {
    return db.payment.update({ where: { id }, data });
  },

  /** Marks PENDING payments older than `olderThan` as FAILED — abandoned
   * checkouts (user closed the tab, never finished paying) would otherwise
   * sit as PENDING forever. Returns how many rows were updated. */
  async expireStalePending(olderThan: Date, db: Db = prisma): Promise<number> {
    const result = await db.payment.updateMany({
      where: { status: "PENDING", createdAt: { lt: olderThan } },
      data: { status: "FAILED" },
    });
    return result.count;
  },
};
