import type { NextRequest } from "next/server";
import { toRouteResponse } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { templateService } from "@/services/template.service";
import { listTemplatesQuerySchema } from "@/validators/template.schema";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";

/** GET /api/templates?category=Birthday&isPremium=false — public, no auth. */
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
