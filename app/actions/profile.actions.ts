"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/session";
import { parseOrThrow } from "@/lib/validation";
import { toActionResult } from "@/lib/api-response";
import { profileService } from "@/services/profile.service";
import { updateProfileSchema } from "@/validators/profile.schema";
import type { ActionResult } from "@/types/api";
import type { PrivateProfile, PublicProfile } from "@/repositories/profile.repository";

export async function getMyProfile(): Promise<ActionResult<PrivateProfile>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return profileService.getOrCreateMyProfile(userId);
  });
}

export async function updateMyProfile(input: unknown): Promise<ActionResult<PrivateProfile>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(updateProfileSchema, input);
    const result = await profileService.updateMyProfile(userId, parsed);
    revalidatePath("/account/profile");
    revalidatePath(`/creators/${userId}`);
    return result;
  });
}

export async function getPublicProfile(userId: string): Promise<ActionResult<PublicProfile>> {
  return toActionResult(async () => profileService.getPublicProfile(userId));
}
