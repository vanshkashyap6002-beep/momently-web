"use client";

import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { createReport } from "@/app/actions/report.actions";

const REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "COPYRIGHT", label: "Copyright" },
  { value: "ADULT_CONTENT", label: "Adult content" },
  { value: "SCAM", label: "Scam" },
  { value: "MALICIOUS_LINKS", label: "Malicious links" },
  { value: "OTHER", label: "Other" },
] as const;

export function ReportButton({
  targetType,
  templateId,
  targetUserId,
}: {
  targetType: "TEMPLATE" | "CREATOR";
  templateId?: string;
  targetUserId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number]["value"]>("SPAM");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await createReport({ targetType, templateId, targetUserId, reason, details });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-ink/40 dark:text-paper/40 hover:text-love dark:hover:text-blush transition-colors"
      >
        <Flag className="h-3 w-3" /> Report
      </button>
    );
  }

  if (done) {
    return <p className="text-xs text-ink/50 dark:text-paper/50">Thanks — this has been reported.</p>;
  }

  return (
    <div className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-4 max-w-xs text-left">
      <p className="text-xs font-medium text-ink dark:text-paper mb-2">Report this {targetType === "TEMPLATE" ? "template" : "creator"}</p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as (typeof REASONS)[number]["value"])}
        className="w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink px-2.5 py-2 text-xs text-ink dark:text-paper mb-2"
      >
        {REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Details (optional)"
        rows={2}
        className="w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink px-2.5 py-2 text-xs text-ink dark:text-paper mb-2"
      />
      {error && <p className="mb-2 text-xs text-love dark:text-blush">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-1.5 rounded-full bg-love px-3 py-1.5 text-xs text-paper hover:bg-love-dark transition-colors disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
          Submit
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
