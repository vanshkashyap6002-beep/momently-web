"use server";

import { parseOrThrow } from "@/lib/validation";
import { toActionResult } from "@/lib/api-response";
import { accountService } from "@/services/account.service";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/validators/account.schema";
import type { ActionResult } from "@/types/api";

export async function requestPasswordReset(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return toActionResult(async () => {
    const { email } = parseOrThrow(requestPasswordResetSchema, input);
    await accountService.requestPasswordReset(email);
    return { ok: true as const };
  });
}

export async function resetPassword(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(resetPasswordSchema, input);
    await accountService.resetPassword(parsed.token, parsed.password);
    return { ok: true as const };
  });
}

export async function verifyEmail(input: unknown): Promise<ActionResult<{ ok: true }>> {
  return toActionResult(async () => {
    const { token } = parseOrThrow(verifyEmailSchema, input);
    await accountService.verifyEmail(token);
    return { ok: true as const };
  });
}
