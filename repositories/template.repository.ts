import { prisma } from "@/lib/prisma";
import type { Prisma, Template } from "@prisma/client";

type Db = typeof prisma | Prisma.TransactionClient;

export interface TemplateFilters {
  category?: string;
  isPremium?: boolean;
}

export const templateRepository = {
  findMany(filters: TemplateFilters, db: Db = prisma): Promise<Template[]> {
    return db.template.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.isPremium !== undefined ? { isPremium: filters.isPremium } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findBySlug(slug: string, db: Db = prisma): Promise<Template | null> {
    return db.template.findUnique({ where: { slug } });
  },

  findById(id: string, db: Db = prisma): Promise<Template | null> {
    return db.template.findUnique({ where: { id } });
  },

  create(data: Prisma.TemplateCreateInput, db: Db = prisma): Promise<Template> {
    return db.template.create({ data });
  },
};
