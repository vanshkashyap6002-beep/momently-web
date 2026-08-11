"use server";

import { requireUserId } from "@/lib/session";
import { parseOrThrow } from "@/lib/validation";
import { toActionResult } from "@/lib/api-response";
import { reportService } from "@/services/report.service";
import { createReportSchema } from "@/validators/report.schema";
import type { ActionResult } from "@/types/api";
import type { Report } from "@prisma/client";

export async function createReport(input: unknown): Promise<ActionResult<Report>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(createReportSchema, input);
    return reportService.createReport(userId, parsed);
  });
}
