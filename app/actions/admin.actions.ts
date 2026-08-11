"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUserId } from "@/lib/session";
import { parseOrThrow } from "@/lib/validation";
import { toActionResult } from "@/lib/api-response";
import { userAdminService } from "@/services/user-admin.service";
import { dashboardService } from "@/services/dashboard.service";
import { projectService } from "@/services/project.service";
import { templateService } from "@/services/template.service";
import { paymentService } from "@/services/payment.service";
import { settingsService } from "@/services/settings.service";
import { communityTemplateService } from "@/services/community-template.service";
import { reportService } from "@/services/report.service";
import {
  userIdSchema,
  changeRoleSchema,
  setSuspendedSchema,
  updateSettingsSchema,
} from "@/validators/admin.schema";
import { createTemplateSchema, updateTemplateSchema } from "@/validators/template.schema";
import { reviewDecisionSchema } from "@/validators/community-template.schema";
import { updateReportStatusSchema } from "@/validators/report.schema";
import type { ActionResult } from "@/types/api";
import type { UserSummary } from "@/repositories/user.repository";
import type { UserWithStats } from "@/services/user-admin.service";
import type { Template } from "@prisma/client";

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  return toActionResult(async () => {
    await requireAdminUserId();
    return dashboardService.getStats();
  });
}

export async function getDashboardCharts() {
  return toActionResult(async () => {
    await requireAdminUserId();
    const [revenue, userGrowth, bestSelling] = await Promise.all([
      dashboardService.getRevenueChart(),
      dashboardService.getUserGrowthChart(),
      dashboardService.getBestSellingTemplates(),
    ]);
    return { revenue, userGrowth, bestSelling };
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers(): Promise<ActionResult<UserWithStats[]>> {
  return toActionResult(async () => {
    await requireAdminUserId();
    return userAdminService.getAllUsers();
  });
}

export async function changeUserRole(input: unknown): Promise<ActionResult<UserSummary>> {
  return toActionResult(async () => {
    const adminId = await requireAdminUserId();
    const parsed = parseOrThrow(changeRoleSchema, input);
    const result = await userAdminService.changeRole(adminId, parsed.userId, parsed.role);
    revalidatePath("/admin-panel/users");
    return result;
  });
}

export async function setUserSuspended(input: unknown): Promise<ActionResult<UserSummary>> {
  return toActionResult(async () => {
    const adminId = await requireAdminUserId();
    const parsed = parseOrThrow(setSuspendedSchema, input);
    const result = await userAdminService.setSuspended(adminId, parsed.userId, parsed.isSuspended);
    revalidatePath("/admin-panel/users");
    return result;
  });
}

export async function deleteUser(input: unknown): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    const adminId = await requireAdminUserId();
    const { id } = parseOrThrow(userIdSchema, input);
    await userAdminService.deleteUser(adminId, id);
    revalidatePath("/admin-panel/users");
    return { id };
  });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function getAllProjects() {
  return toActionResult(async () => {
    await requireAdminUserId();
    return projectService.getAllProjectsForAdmin();
  });
}

export async function deleteProjectAsAdmin(input: unknown): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    await requireAdminUserId();
    const { id } = parseOrThrow(userIdSchema, input);
    await projectService.deleteProjectAsAdmin(id);
    revalidatePath("/admin-panel/projects");
    return { id };
  });
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function getAllTemplatesForAdmin() {
  return toActionResult(async () => {
    await requireAdminUserId();
    return templateService.getAllTemplatesForAdmin();
  });
}

export async function createTemplate(input: unknown): Promise<ActionResult<Template>> {
  return toActionResult(async () => {
    await requireAdminUserId();
    const parsed = parseOrThrow(createTemplateSchema, input);
    const result = await templateService.createTemplate(parsed);
    revalidatePath("/admin-panel/templates");
    return result;
  });
}

export async function updateTemplate(id: string, input: unknown): Promise<ActionResult<Template>> {
  return toActionResult(async () => {
    await requireAdminUserId();
    const parsed = parseOrThrow(updateTemplateSchema, input);
    const result = await templateService.updateTemplate(id, parsed);
    revalidatePath("/admin-panel/templates");
    return result;
  });
}

export async function deleteTemplate(input: unknown): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    await requireAdminUserId();
    const { id } = parseOrThrow(userIdSchema, input);
    await templateService.deleteTemplate(id);
    revalidatePath("/admin-panel/templates");
    return { id };
  });
}

// ---------------------------------------------------------------------------
// Payments & Orders (same underlying data, two admin views)
// ---------------------------------------------------------------------------

export async function getAllPayments() {
  return toActionResult(async () => {
    await requireAdminUserId();
    return paymentService.getAllPaymentsForAdmin();
  });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function getSettings() {
  return toActionResult(async () => {
    await requireAdminUserId();
    const [settings, integrations] = await Promise.all([
      settingsService.getSettings(),
      Promise.resolve(settingsService.getIntegrationStatus()),
    ]);
    return { settings, integrations };
  });
}

export async function updateSettings(input: unknown) {
  return toActionResult(async () => {
    await requireAdminUserId();
    const parsed = parseOrThrow(updateSettingsSchema, input);
    const result = await settingsService.updateSettings(parsed);
    revalidatePath("/admin-panel/settings");
    return result;
  });
}

// ---------------------------------------------------------------------------
// Community Template review (Community Template System)
// ---------------------------------------------------------------------------

export async function getPendingReviewTemplates() {
  return toActionResult(async () => {
    await requireAdminUserId();
    return communityTemplateService.getPendingReview();
  });
}

export async function reviewTemplate(input: unknown) {
  return toActionResult(async () => {
    const adminId = await requireAdminUserId();
    const parsed = parseOrThrow(reviewDecisionSchema, input);
    const result = await communityTemplateService.reviewTemplate(adminId, parsed);
    revalidatePath("/admin-panel/reviews");
    revalidatePath("/admin-panel/templates");
    return result;
  });
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function getReports() {
  return toActionResult(async () => {
    await requireAdminUserId();
    return reportService.getAllReportsForAdmin();
  });
}

export async function updateReportStatus(input: unknown) {
  return toActionResult(async () => {
    await requireAdminUserId();
    const parsed = parseOrThrow(updateReportStatusSchema, input);
    const result = await reportService.updateReportStatus(parsed.id, parsed.status);
    revalidatePath("/admin-panel/reports");
    return result;
  });
}
