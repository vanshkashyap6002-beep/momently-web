import { prisma } from "@/lib/prisma";
import type { Prisma, Template } from "@prisma/client";

type Db = typeof prisma | Prisma.TransactionClient;

export interface TemplateFilters {
  category?: string;
  isPremium?: boolean;
}

export const templateRepository = {
  // Public-facing: only templates that have actually cleared moderation may
  // be listed. Internal/admin lookups must NOT use this — see
  // findAllForAdmin (unfiltered, admin panel) and findBySlug (unfiltered,
  // used internally by ensureTemplateFromMarketplaceSlug to find an
  // existing row of ANY status so it doesn't create a duplicate).
  findMany(filters: TemplateFilters, db: Db = prisma): Promise<Template[]> {
    return db.template.findMany({
      where: {
        isEnabled: true,
        reviewStatus: "APPROVED",
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.isPremium !== undefined ? { isPremium: filters.isPremium } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  // Public-facing single-template lookup — enforces the same isEnabled +
  // APPROVED rule as findMany above. Use this (not findBySlug) for anything
  // an unauthenticated/normal user can reach.
  findPublicBySlug(slug: string, db: Db = prisma): Promise<Template | null> {
    return db.template.findFirst({
      where: { slug, isEnabled: true, reviewStatus: "APPROVED" },
    });
  },

  // Internal/unfiltered lookup by slug — returns a template regardless of
  // review status or enabled flag. Deliberately NOT used for public reads;
  // see findPublicBySlug for that. Kept as-is for
  // ensureTemplateFromMarketplaceSlug's existence check.
  findBySlug(slug: string, db: Db = prisma): Promise<Template | null> {
    return db.template.findUnique({ where: { slug } });
  },

  findById(id: string, db: Db = prisma): Promise<Template | null> {
    return db.template.findUnique({ where: { id } });
  },

  create(data: Prisma.TemplateCreateInput, db: Db = prisma): Promise<Template> {
    return db.template.create({ data });
  },

  // Public-facing, same isEnabled/APPROVED filter as findMany, with the
  // creator's display name attached — used by the Marketplace grid so
  // community-submitted cards can show a real "by <creator>" credit instead
  // of a placeholder.
  findManyPublicWithCreator(db: Db = prisma) {
    return db.template.findMany({
      where: { isEnabled: true, reviewStatus: "APPROVED" },
      include: { creator: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  // ---- Admin Panel additions below — existing methods above are untouched ----

  findAllForAdmin(db: Db = prisma): Promise<Template[]> {
    return db.template.findMany({ orderBy: { createdAt: "desc" } });
  },

  update(id: string, data: Prisma.TemplateUpdateInput, db: Db = prisma): Promise<Template> {
    return db.template.update({ where: { id }, data });
  },

  delete(id: string, db: Db = prisma): Promise<void> {
    return db.template.delete({ where: { id } }).then(() => undefined);
  },

  // ---- Community Template System additions below — existing methods above are untouched ----

  findManyByCreator(creatorId: string, db: Db = prisma): Promise<Template[]> {
    return db.template.findMany({ where: { creatorId }, orderBy: { createdAt: "desc" } });
  },

  findByIdAndCreator(id: string, creatorId: string, db: Db = prisma): Promise<Template | null> {
    return db.template.findFirst({ where: { id, creatorId } });
  },

  findPendingReview(db: Db = prisma) {
    return db.template.findMany({
      where: { reviewStatus: "PENDING_REVIEW" },
      include: { creator: { select: { id: true, fullName: true, email: true } } },
      orderBy: { submittedAt: "asc" },
    });
  },
};
