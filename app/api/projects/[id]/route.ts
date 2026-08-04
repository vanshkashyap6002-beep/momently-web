import type { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { toRouteResponse } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";
import { projectService } from "@/services/project.service";
import { updateProjectSchema } from "@/validators/project.schema";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/projects/[id] */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return toRouteResponse(async () => {
    const { id } = await params;
    const userId = await requireUserId();
    return projectService.getProject(userId, id);
  });
}

/** PATCH /api/projects/[id] — partial update. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return toRouteResponse(async () => {
    const { id } = await params;
    const userId = await requireUserId();
    const body = await request.json().catch(() => {
      throw new ValidationError("Request body must be valid JSON.");
    });
    const input = parseOrThrow(updateProjectSchema, body);
    return projectService.updateProject(userId, id, input);
  });
}

/** DELETE /api/projects/[id] */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return toRouteResponse(async () => {
    const { id } = await params;
    const userId = await requireUserId();
    await projectService.deleteProject(userId, id);
    return { id };
  });
}
