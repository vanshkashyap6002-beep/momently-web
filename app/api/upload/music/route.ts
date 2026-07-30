import type { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { toRouteResponse } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";
import { mediaService } from "@/services/media.service";
import { mediaFileSchema, projectIdFieldSchema } from "@/validators/media.schema";

export const runtime = "nodejs";

/** POST /api/upload/music — multipart/form-data: { file, projectId } */
export async function POST(request: NextRequest) {
  return toRouteResponse(async () => {
    const userId = await requireUserId();
    const formData = await request.formData().catch(() => {
      throw new ValidationError("Request must be multipart/form-data.");
    });

    const { projectId } = parseOrThrow(projectIdFieldSchema, {
      projectId: formData.get("projectId"),
    });
    const file = parseOrThrow(mediaFileSchema("MUSIC"), formData.get("file"));

    return mediaService.uploadMusic(userId, projectId, file);
  }, 201);
}
