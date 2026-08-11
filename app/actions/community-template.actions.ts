"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/session";
import { parseOrThrow } from "@/lib/validation";
import { toActionResult } from "@/lib/api-response";
import { communityTemplateService } from "@/services/community-template.service";
import {
  createDraftTemplateSchema,
  updateDraftTemplateSchema,
} from "@/validators/community-template.schema";
import type { ActionResult } from "@/types/api";
import type { Template } from "@prisma/client";

export async function createDraftTemplate(input: unknown): Promise<ActionResult<Template>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(createDraftTemplateSchema, input);
    const result = await communityTemplateService.createDraft(userId, parsed);
    revalidatePath("/account/templates");
    return result;
  });
}

export async function getMyTemplates(): Promise<ActionResult<Template[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return communityTemplateService.getMyTemplates(userId);
  });
}

export async function updateDraftTemplate(id: string, input: unknown): Promise<ActionResult<Template>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(updateDraftTemplateSchema, input);
    const result = await communityTemplateService.updateDraft(userId, id, parsed);
    revalidatePath("/account/templates");
    return result;
  });
}

export async function deleteDraftTemplate(id: string): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await communityTemplateService.deleteDraft(userId, id);
    revalidatePath("/account/templates");
    return { id };
  });
}

export async function submitTemplateForReview(id: string): Promise<ActionResult<Template>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const result = await communityTemplateService.submitForReview(userId, id);
    revalidatePath("/account/templates");
    return result;
  });
}
