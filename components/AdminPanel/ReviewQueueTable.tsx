"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, RotateCcw, AlertTriangle } from "lucide-react";
import { reviewTemplate } from "@/app/actions/admin.actions";
import type { Template } from "@prisma/client";
import type { ScanFlag } from "@/lib/content-scanner";

type PendingTemplate = Template & { creator: { id: string; fullName: string; email: string } | null };

export function ReviewQueueTable({ templates }: { templates: PendingTemplate[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function decide(id: string, decision: "APPROVED" | "REJECTED" | "NEEDS_CHANGES") {
    setPendingId(id);
    setError(null);
    const result = await reviewTemplate({ id, decision, note: notes[id] });
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  if (templates.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/15 dark:border-paper/20 py-12 text-center text-sm text-ink/45 dark:text-paper/45">
        Nothing pending review.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-love/10 px-3 py-2 text-xs text-love dark:text-blush">{error}</p>
      )}
      {templates.map((template) => {
        const flags = (template.autoFlags as ScanFlag[] | null) ?? [];
        const isPending = pendingId === template.id;

        return (
          <div
            key={template.id}
            className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink dark:text-paper">{template.title}</p>
                <p className="text-xs text-ink/50 dark:text-paper/50">
                  {template.category} · by {template.creator?.fullName ?? "Unknown"} ({template.creator?.email})
                </p>
              </div>
              <span className="text-xs text-ink/40 dark:text-paper/40 shrink-0">
                {template.submittedAt ? new Date(template.submittedAt).toLocaleDateString() : ""}
              </span>
            </div>

            <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">{template.description}</p>

            {flags.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {flags.map((flag, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-1.5 text-xs rounded-lg px-2.5 py-1.5 ${
                      flag.severity === "high"
                        ? "bg-love/10 text-love dark:text-blush"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {flag.message}
                  </div>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Note for the creator (optional)"
              value={notes[template.id] ?? ""}
              onChange={(e) => setNotes((prev) => ({ ...prev, [template.id]: e.target.value }))}
              className="mt-3 w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink px-3 py-2 text-xs text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-love/30 dark:focus:ring-blush/30"
            />

            {isPending ? (
              <Loader2 className="mt-3 h-4 w-4 animate-spin text-ink/40 dark:text-paper/40" />
            ) : (
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => decide(template.id, "APPROVED")}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
                <button
                  onClick={() => decide(template.id, "NEEDS_CHANGES")}
                  className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs text-white hover:bg-amber-600 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Needs changes
                </button>
                <button
                  onClick={() => decide(template.id, "REJECTED")}
                  className="flex items-center gap-1.5 rounded-full bg-love px-3 py-1.5 text-xs text-paper hover:bg-love-dark transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
