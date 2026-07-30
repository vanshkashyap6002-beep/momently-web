import type { NextRequest } from "next/server";
import { toRouteResponse } from "@/lib/api-response";
import { templateService } from "@/services/template.service";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/** GET /api/templates/[slug] — public, no auth. */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return toRouteResponse(async () => {
    const { slug } = await params;
    return templateService.getTemplateBySlug(slug);
  });
}
