import { prisma } from "@/lib/prisma";
import type { Prisma, Profile } from "@prisma/client";

export type PrivateProfile = Profile;

export interface PublicProfile {
  displayName: string;
  bio: string | null;
  isVerified: boolean;
  joinedAt: Date;
  publishedTemplateCount: number;
  downloadCount: number;
}

export const profileRepository = {
  findByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { userId } });
  },

  upsert(userId: string, data: Prisma.ProfileCreateWithoutUserInput): Promise<Profile> {
    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },

  /**
   * The ONLY query used to render a public creator profile. Deliberately
   * narrow: it selects exactly the fields the public page is allowed to
   * show, plus a live count of the creator's publicly-visible templates —
   * private fields (birthday/anniversary/partnerName/preferences) and
   * account fields (email/password/phone/payment info) are never even in
   * scope here, not just filtered out afterward.
   */
  async findPublicProfile(userId: string): Promise<PublicProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullName: true,
        createdAt: true,
        profile: {
          select: { displayName: true, bio: true, isPublic: true, isVerified: true },
        },
      },
    });

    if (!user || !user.profile?.isPublic) return null;

    const [publishedTemplateCount, downloadCount] = await Promise.all([
      prisma.template.count({ where: { creatorId: userId, isEnabled: true } }),
      prisma.project.count({ where: { template: { creatorId: userId } } }),
    ]);

    return {
      displayName: user.profile.displayName || user.fullName,
      bio: user.profile.bio,
      isVerified: user.profile.isVerified,
      joinedAt: user.createdAt,
      publishedTemplateCount,
      downloadCount,
    };
  },
};
