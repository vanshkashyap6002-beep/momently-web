import type { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { toRouteResponse } from "@/lib/api-response";
import { parseOrThrow } from "@/lib/validation";
import { ValidationError } from "@/lib/errors";
import { projectService } from "@/services/project.service";
import { createProjectSchema } from "@/validators/project.schema";

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
