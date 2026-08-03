import { notFound } from "next/navigation";
import { templateRepository } from "@/repositories/template.repository";
import { TemplateForm } from "@/components/AdminPanel/TemplateForm";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await templateRepository.findById(id);

  if (!template) notFound();

  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Edit Template</h1>

      <div className="mt-6">
        <TemplateForm template={template} />
      </div>
    </div>
  );
}
