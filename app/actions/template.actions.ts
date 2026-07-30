"use server";

import { toActionResult } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { templateService } from "@/services/template.service";
import { listTemplatesQuerySchema, templateSlugSchema } from "@/validators/template.schema";
import type { Template } from "@prisma/client";
import type { ActionResult } from "@/types/api";

export async function getTemplates(
  filters: unknown = {}
): Promise<ActionResult<Template[]>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(listTemplatesQuerySchema, filters);
    return templateService.getTemplates(parsed);
  });
}

export async function getTemplateBySlug(slug: string): Promise<ActionResult<Template>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(templateSlugSchema, { slug });
    return templateService.getTemplateBySlug(parsed.slug);
  });
}
