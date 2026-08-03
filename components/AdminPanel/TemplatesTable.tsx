"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/AdminPanel/StatusBadge";
import { updateTemplate, deleteTemplate } from "@/app/actions/admin.actions";
import type { Template } from "@prisma/client";

export function TemplatesTable({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(id: string, field: "isEnabled" | "isFeatured", value: boolean) {
    setPendingId(id);
    setError(null);
    const result = await updateTemplate(id, { [field]: value });
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    setPendingId(id);
    setError(null);
    const result = await deleteTemplate({ id });
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-love/10 px-3 py-2 text-xs text-love dark:text-blush">{error}</p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-ink/10 dark:border-paper/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 dark:border-paper/10 text-left text-xs text-ink/50 dark:text-paper/50">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id} className="border-b border-ink/5 dark:border-paper/5 last:border-0">
                <td className="px-4 py-3 text-ink dark:text-paper">{template.title}</td>
                <td className="px-4 py-3 text-ink/60 dark:text-paper/60">{template.category}</td>
                <td className="px-4 py-3 text-ink/60 dark:text-paper/60">
                  {Number(template.price) > 0 ? `₹${Number(template.price).toLocaleString("en-IN")}` : "Free"}
                </td>
                <td className="px-4 py-3">
                  {pendingId === template.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-ink/40 dark:text-paper/40" />
                  ) : (
                    <button onClick={() => toggle(template.id, "isEnabled", !template.isEnabled)}>
                      <StatusBadge status={template.isEnabled ? "ENABLED" : "DISABLED"} />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggle(template.id, "isFeatured", !template.isFeatured)}
                    className={
                      template.isFeatured
                        ? "text-love dark:text-blush text-xs font-medium"
                        : "text-ink/40 dark:text-paper/40 text-xs"
                    }
                  >
                    {template.isFeatured ? "★ Featured" : "☆ Not featured"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/admin-panel/templates/${template.id}`}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-ink/50 hover:bg-ink/5 hover:text-love dark:text-paper/50 dark:hover:bg-paper/10 dark:hover:text-blush"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(template.id, template.title)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-ink/50 hover:bg-love/10 hover:text-love dark:text-paper/50 dark:hover:text-blush"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {templates.length === 0 && (
          <p className="py-10 text-center text-sm text-ink/45 dark:text-paper/45">No templates yet.</p>
        )}
      </div>
    </div>
  );
}
