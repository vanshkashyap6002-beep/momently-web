import type { NextRequest } from "next/server";
import { toRouteResponse } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { templateService } from "@/services/template.service";
import { listTemplatesQuerySchema } from "@/validators/template.schema";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return toRouteResponse(async () => {
    const { searchParams } = new URL(request.url);
    const query = parseOrThrow(listTemplatesQuerySchema, {
      category: searchParams.get("category") ?? undefined,
      isPremium: searchParams.get("isPremium") ?? undefined,
    });
    return templateService.getTemplates(query);
  });
}
