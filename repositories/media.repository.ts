import { prisma } from "@/lib/prisma";
import type { Prisma, Media } from "@prisma/client";
import type { ReorderItem } from "@/types/media";

type Db = typeof prisma | Prisma.TransactionClient;

export const mediaRepository = {
  findById(id: string, db: Db = prisma): Promise<Media | null> {
    return db.media.findUnique({ where: { id } });
  },

  findManyByProjectId(projectId: string, db: Db = prisma): Promise<Media[]> {
    return db.media.findMany({ where: { projectId }, orderBy: { order: "asc" } });
  },

  /** Next append position for a given project+type, so new uploads land
   * after whatever's already there instead of colliding on order 0. */
  async getNextOrder(projectId: string, type: Media["type"], db: Db = prisma): Promise<number> {
    const last = await db.media.findFirst({
      where: { projectId, type },
      orderBy: { order: "desc" },
    });
    return last ? last.order + 1 : 0;
  },

  create(data: Prisma.MediaCreateInput, db: Db = prisma): Promise<Media> {
    return db.media.create({ data });
  },

  update(id: string, data: Prisma.MediaUpdateInput, db: Db = prisma): Promise<Media> {
    return db.media.update({ where: { id }, data });
  },

  delete(id: string, db: Db = prisma): Promise<Media> {
    return db.media.delete({ where: { id } });
  },

  /** Applies every {id, order} pair in one transaction — all-or-nothing,
   * so a reorder can never leave the gallery in a half-updated state. */
  async reorderMany(items: ReorderItem[]): Promise<void> {
    await prisma.$transaction(
      items.map((item) => prisma.media.update({ where: { id: item.id }, data: { order: item.order } }))
    );
  },
};
