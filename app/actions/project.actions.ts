"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/session";
import { parseOrThrow } from "@/lib/validation";
import { toActionResult } from "@/lib/api-response";
import { projectService } from "@/services/project.service";
import {
  createProjectSchema,
  updateProjectSchema,
  saveProjectContentSchema,
} from "@/validators/project.schema";
import type { ProjectWithMedia } from "@/repositories/project.repository";
import type { ActionResult } from "@/types/api";

export async function createProject(input: unknown): Promise<ActionResult<ProjectWithMedia>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(createProjectSchema, input);
    const project = await projectService.createProject(userId, parsed);
    revalidatePath("/marketplace");
    return project;
  });
}

export async function updateProject(projectId: string, input: unknown): Promise<ActionResult<ProjectWithMedia>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(updateProjectSchema, input);
    return projectService.updateProject(userId, projectId, parsed);
  });
}

export async function deleteProject(projectId: string): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    await projectService.deleteProject(userId, projectId);
    revalidatePath("/marketplace");
    return { id: projectId };
  });
}

/** Wired to the Studio's "Save Draft" button. */
export async function saveDraft(input: unknown): Promise<ActionResult<ProjectWithMedia>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(saveProjectContentSchema, input);
    return projectService.saveDraft(userId, parsed);
  });
}

/** Wired to the Studio's "Publish" button. */
export async function publishProject(input: unknown): Promise<ActionResult<ProjectWithMedia>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const parsed = parseOrThrow(saveProjectContentSchema, input);
    return projectService.publishProject(userId, parsed);
  });
}

/** Wired to the Checkout page's post-payment step — flips a project to
 * PUBLISHED after `verifyPayment` succeeds; content was already saved by
 * `publishProject` before the redirect to checkout. */
export async function confirmPublish(projectId: string): Promise<ActionResult<ProjectWithMedia>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return projectService.publishExistingProject(userId, projectId);
  });
}

export async function unpublishProject(projectId: string): Promise<ActionResult<ProjectWithMedia>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return projectService.unpublishProject(userId, projectId);
  });
}

export async function duplicateProject(projectId: string): Promise<ActionResult<ProjectWithMedia>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    const project = await projectService.duplicateProject(userId, projectId);
    revalidatePath("/marketplace");
    return project;
  });
}

export async function getProject(projectId: string): Promise<ActionResult<ProjectWithMedia>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return projectService.getProject(userId, projectId);
  });
}

export async function getProjects(): Promise<ActionResult<ProjectWithMedia[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId();
    return projectService.getProjects(userId);
  });
}
