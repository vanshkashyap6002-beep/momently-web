import { prisma } from "@/lib/prisma";
import type { Prisma, Project, Media } from "@prisma/client";

/** Either the global client or an active `$transaction` callback client —
 * every method accepts either, so the service layer can compose multiple
 * repository calls into one atomic transaction when needed. */
type Db = typeof prisma | Prisma.TransactionClient;

export type ProjectWithMedia = Project & { media: Media[] };

const withOrderedMedia = {
  media: { orderBy: { order: "asc" as const } },
} satisfies Prisma.ProjectInclude;

export interface MediaItemInput {
  type: Media["type"];
  url: string;
  publicId?: string | null;
  filename: string;
  fileSize?: number;
  mimeType?: string;
  order: number;
}

export const projectRepository = {
  findById(id: string, db: Db = prisma): Promise<ProjectWithMedia | null> {
    return db.project.findUnique({ where: { id }, include: withOrderedMedia });
  },

  findBySlug(slug: string, db: Db = prisma): Promise<ProjectWithMedia | null> {
    return db.project.findUnique({ where: { slug }, include: withOrderedMedia });
  },

  findManyByUserId(userId: string, db: Db = prisma): Promise<ProjectWithMedia[]> {
    return db.project.findMany({
      where: { userId },
      include: withOrderedMedia,
      orderBy: { updatedAt: "desc" },
    });
  },

  create(data: Prisma.ProjectCreateInput, db: Db = prisma): Promise<ProjectWithMedia> {
    return db.project.create({ data, include: withOrderedMedia });
  },

  /** Creates a Project and its Media rows in a single nested write. */
  createWithMedia(
    data: Prisma.ProjectCreateInput,
    mediaItems: MediaItemInput[],
    db: Db = prisma
  ): Promise<ProjectWithMedia> {
    return db.project.create({
      data: { ...data, media: { create: mediaItems } },
      include: withOrderedMedia,
    });
  },

  update(id: string, data: Prisma.ProjectUpdateInput, db: Db = prisma): Promise<ProjectWithMedia> {
    return db.project.update({ where: { id }, data, include: withOrderedMedia });
  },

  delete(id: string, db: Db = prisma): Promise<Project> {
    return db.project.delete({ where: { id } });
  },
};
