import type { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { toRouteResponse } from "@/lib/api-response";
import { mediaService } from "@/services/media.service";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** DELETE /api/media/[id] — removes the DB row and its storage asset. */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return toRouteResponse(async () => {
    const { id } = await params;
    const userId = await requireUserId();
    await mediaService.deleteMedia(userId, id);
    return { id };
  });
}
