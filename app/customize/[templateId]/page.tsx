import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { projectService } from "@/services/project.service";
import { paymentService } from "@/services/payment.service";
import { projectToEditableState } from "@/lib/project-mapper";
import { StudioProvider } from "@/hooks/use-memory-studio";
import { MemoryStudio } from "@/components/Customization/MemoryStudio";
import { marketplaceTemplates } from "@/lib/marketplace-data";
import type { EditableStudioState } from "@/types/studio";

// Explicit, even though getServerSession() reading cookies already
// implicitly forces this — this route deals with per-user, per-request
// data and must never be statically cached.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Memory Studio — Momently",
  description: "Customize your memory page.",
};

function resolveTemplateName(templateId: string) {
  const match = marketplaceTemplates.find((t) => t.slug === templateId || t.id === templateId);
  return match?.name ?? "Untitled Memory";
}

export default async function CustomizePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/customize/${templateId}`);
  }

  const templateName = resolveTemplateName(templateId);

  // Guarantees a DRAFT Project row exists before the Studio ever renders,
  // so every media upload has a real projectId to attach to from the very
  // first photo — not just after the user manually clicks Save Draft.
  const project = await projectService.getOrCreateStudioProject(
    session.user.id,
    templateId,
    templateName
  );

  // Premium templates require payment before editing even starts — not
  // just before publishing. Free templates skip straight through.
  const unlocked = await paymentService.isProjectUnlocked(project.id, project.templateId);
  if (!unlocked) {
    redirect(`/checkout/${project.id}`);
  }

  const initialState: EditableStudioState = projectToEditableState(project);

  return (
    <StudioProvider
      templateId={templateId}
      templateName={templateName}
      projectId={project.id}
      initialState={initialState}
    >
      <MemoryStudio />
    </StudioProvider>
  );
}
