import { prisma } from "@/lib/prisma";
import type { Settings } from "@prisma/client";

const SINGLETON_ID = "singleton";

export const settingsRepository = {
  async get(): Promise<Settings> {
    return prisma.settings.upsert({
      where: { id: SINGLETON_ID },
      update: {},
      create: { id: SINGLETON_ID },
    });
  },

  update(data: { siteName?: string; maintenanceMode?: boolean }): Promise<Settings> {
    return prisma.settings.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });
  },
};
