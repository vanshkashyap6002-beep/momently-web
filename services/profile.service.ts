import { profileRepository, type PrivateProfile, type PublicProfile } from "@/repositories/profile.repository";
import { NotFoundError } from "@/lib/errors";
import type { UpdateProfileInput } from "@/validators/profile.schema";
import type { Prisma } from "@prisma/client";

export const profileService = {
  /** Always returns a profile for the given user, creating an empty
   * (private-by-default) one on first visit — mirrors the same
   * "guarantee a row exists" pattern used for Studio projects. */
  async getOrCreateMyProfile(userId: string): Promise<PrivateProfile> {
    const existing = await profileRepository.findByUserId(userId);
    if (existing) return existing;
    return profileRepository.upsert(userId, {});
  },

  updateMyProfile(userId: string, input: UpdateProfileInput): Promise<PrivateProfile> {
    const data: Prisma.ProfileCreateWithoutUserInput = {};
    if (input.displayName !== undefined) data.displayName = input.displayName || null;
    if (input.bio !== undefined) data.bio = input.bio || null;
    if (input.isPublic !== undefined) data.isPublic = input.isPublic;
    if (input.birthday !== undefined) data.birthday = input.birthday ? new Date(input.birthday) : null;
    if (input.anniversary !== undefined) data.anniversary = input.anniversary ? new Date(input.anniversary) : null;
    if (input.partnerName !== undefined) data.partnerName = input.partnerName || null;
    if (input.preferences !== undefined) data.preferences = input.preferences as Prisma.InputJsonValue;

    return profileRepository.upsert(userId, data);
  },

  async getPublicProfile(userId: string): Promise<PublicProfile> {
    const profile = await profileRepository.findPublicProfile(userId);
    if (!profile) throw new NotFoundError("This profile is private or doesn't exist.");
    return profile;
  },
};
