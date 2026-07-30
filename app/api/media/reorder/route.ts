import type { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { toRouteResponse } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";
import { mediaService } from "@/services/media.service";
import { reorderMediaSchema } from "@/validators/media.schema";

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
