import type { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { toRouteResponse } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";
import { mediaService } from "@/services/media.service";
import { reorderMediaSchema } from "@/validators/media.schema";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";

/** PATCH /api/media/reorder — body: { projectId, items: [{ id, order }] } */
export async function PATCH(request: NextRequest) {
  return toRouteResponse(async () => {
    const userId = await requireUserId();
    const body = await request.json().catch(() => {
      throw new ValidationError("Request body must be valid JSON.");
    });
    const { projectId, items } = parseOrThrow(reorderMediaSchema, body);
    await mediaService.reorderMedia(userId, projectId, items);
    return { ok: true as const };
  });
}
