"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Pencil, Send } from "lucide-react";
import { StatusBadge } from "@/components/AdminPanel/StatusBadge";
import { submitTemplateForReview, deleteDraftTemplate } from "@/app/actions/community-template.actions";
import type { Template } from "@prisma/client";

export function MyTemplatesTable({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(id: string) {
    setPendingId(id);
    setError(null);
    const result = await submitTemplateForReview(id);
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete draft "${title}"?`)) return;
    setPendingId(id);
    setError(null);
    const result = await deleteDraftTemplate(id);
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  if (templates.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/15 dark:border-paper/20 py-12 text-center text-sm text-ink/45 dark:text-paper/45">
        You haven&apos;t created any templates yet.
      </p>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg bg-love/10 px-3 py-2 text-xs text-love dark:text-blush">{error}</p>
      )}
      <div className="space-y-3">
        {templates.map((template) => {
          const editable = template.reviewStatus === "DRAFT" || template.reviewStatus === "NEEDS_CHANGES";
          const isPending = pendingId === template.id;

          return (
            <div
              key={template.id}
              className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink dark:text-paper truncate">{template.title}</p>
                  <p className="text-xs text-ink/50 dark:text-paper/50">{template.category}</p>
                </div>
                <StatusBadge status={template.reviewStatus} />
              </div>

              {template.reviewNote && (
                <p className="mt-3 rounded-lg bg-ink/5 dark:bg-paper/5 px-3 py-2 text-xs text-ink/60 dark:text-paper/60">
                  Admin note: {template.reviewNote}
                </p>
              )}

              {isPending ? (
                <Loader2 className="mt-3 h-4 w-4 animate-spin text-ink/40 dark:text-paper/40" />
              ) : (
                editable && (
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/account/templates/${template.id}`}
                      className="flex items-center gap-1.5 rounded-full border border-ink/15 dark:border-paper/20 px-3 py-1.5 text-xs text-ink dark:text-paper hover:border-love/40 dark:hover:border-blush/40 transition-colors"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                    <button
                      onClick={() => handleSubmit(template.id)}
                      className="flex items-center gap-1.5 rounded-full bg-love px-3 py-1.5 text-xs text-paper hover:bg-love-dark transition-colors"
                    >
                      <Send className="h-3 w-3" /> Submit for review
                    </button>
                    <button
                      onClick={() => handleDelete(template.id, template.title)}
                      className="ml-auto h-7 w-7 flex items-center justify-center rounded-md text-ink/40 hover:bg-love/10 hover:text-love dark:text-paper/40 dark:hover:text-blush"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
