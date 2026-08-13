import type { NextRequest } from "next/server";
import { toRouteResponse } from "@/lib/api-response";
import { templateService } from "@/services/template.service";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";

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
