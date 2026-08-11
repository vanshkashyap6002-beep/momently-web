"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/AdminPanel/StatusBadge";
import { updateReportStatus } from "@/app/actions/admin.actions";
import type { Report, ReportStatus } from "@prisma/client";

type AdminReport = Report & {
  reporter: { fullName: string; email: string };
  template: { title: string; slug: string } | null;
  targetUser: { fullName: string; email: string } | null;
};

export function ReportsTable({ reports }: { reports: AdminReport[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setStatus(id: string, status: ReportStatus) {
    setPendingId(id);
    setError(null);
    const result = await updateReportStatus({ id, status });
    setPendingId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  if (reports.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink/15 dark:border-paper/20 py-12 text-center text-sm text-ink/45 dark:text-paper/45">
        No reports filed.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-love/10 px-3 py-2 text-xs text-love dark:text-blush">{error}</p>
      )}
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status={report.reason} />
                <StatusBadge status={report.status} />
              </div>
              <p className="mt-2 text-sm text-ink dark:text-paper">
                {report.targetType === "TEMPLATE"
                  ? `Template: ${report.template?.title ?? "Unknown"}`
                  : `Creator: ${report.targetUser?.fullName ?? "Unknown"}`}
              </p>
              <p className="text-xs text-ink/50 dark:text-paper/50">
                Reported by {report.reporter.fullName} ({report.reporter.email}) ·{" "}
                {new Date(report.createdAt).toLocaleDateString()}
              </p>
              {report.details && (
                <p className="mt-2 text-xs text-ink/60 dark:text-paper/60">{report.details}</p>
              )}
            </div>

            {pendingId === report.id ? (
              <Loader2 className="h-4 w-4 animate-spin text-ink/40 dark:text-paper/40 shrink-0" />
            ) : (
              report.status === "OPEN" && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setStatus(report.id, "REVIEWED")}
                    title="Mark reviewed"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-ink/50 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-paper/50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setStatus(report.id, "DISMISSED")}
                    title="Dismiss"
                    className="h-7 w-7 flex items-center justify-center rounded-md text-ink/50 hover:bg-ink/10 dark:text-paper/50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
