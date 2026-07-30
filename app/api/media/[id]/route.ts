import type { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { toRouteResponse } from "@/lib/api-response";
import { mediaService } from "@/services/media.service";

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
