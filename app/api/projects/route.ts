import type { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { toRouteResponse } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";
import { projectService } from "@/services/project.service";
import { createProjectSchema } from "@/validators/project.schema";

// Never statically prerendered/cached — this route always touches the
// database and/or the current request's auth state. Without this,
// Next.js can attempt to run it once at BUILD time (to bake a cached
// response), when the database is not expected to be reachable — this
// is exactly what caused the "Can't reach database server" build error.
export const dynamic = "force-dynamic";

/** GET /api/projects — all of the current user's projects. */
export async function GET() {
  return toRouteResponse(async () => {
    const userId = await requireUserId();
    return projectService.getProjects(userId);
  });
}

/** POST /api/projects — create a new draft project from a template. */
export async function POST(request: NextRequest) {
  return toRouteResponse(async () => {
    const userId = await requireUserId();
    const body = await request.json().catch(() => {
      throw new ValidationError("Request body must be valid JSON.");
    });
    const input = parseOrThrow(createProjectSchema, body);
    return projectService.createProject(userId, input);
  }, 201);
}
