import { TemplateForm } from "@/components/AdminPanel/TemplateForm";

export default function NewTemplatePage() {
  return (
    <div>
      <p className="eyebrow">Admin Panel</p>
      <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">New Template</h1>

      <div className="mt-6">
        <TemplateForm />
      </div>
    </div>
  );
}
