import Link from "next/link";
import { Plus } from "lucide-react";
import { templateService } from "@/services/template.service";
import { TemplatesTable } from "@/components/AdminPanel/TemplatesTable";

export default async function AdminTemplatesPage() {
  const templates = await templateService.getAllTemplatesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1 className="mt-2 font-display text-2xl md:text-3xl text-ink dark:text-paper">Templates</h1>
          <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">{templates.length} total</p>
        </div>
        <Link
          href="/admin-panel/templates/new"
          className="flex items-center gap-1.5 rounded-full bg-love px-4 py-2.5 text-sm font-medium text-paper hover:bg-love-dark transition-colors"
        >
          <Plus className="h-4 w-4" /> New Template
        </Link>
      </div>

      <div className="mt-6">
        <TemplatesTable templates={templates} />
      </div>
    </div>
  );
}
