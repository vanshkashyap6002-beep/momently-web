import { cn } from "@/lib/utils";

const toneClasses: Record<string, string> = {
  neutral: "bg-ink/10 text-ink/70 dark:bg-paper/10 dark:text-paper/70",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-love/10 text-love dark:text-blush",
  accent: "bg-love/10 text-love dark:text-blush",
};

const statusTone: Record<string, keyof typeof toneClasses> = {
  ADMIN: "accent",
  USER: "neutral",
  DRAFT: "neutral",
  PUBLISHED: "success",
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "danger",
  ACTIVE: "success",
  SUSPENDED: "danger",
  ENABLED: "success",
  DISABLED: "neutral",
  // Community Template System
  PENDING_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  NEEDS_CHANGES: "warning",
  // Reports
  OPEN: "warning",
  REVIEWED: "success",
  DISMISSED: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = statusTone[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
        toneClasses[tone]
      )}
    >
      {status.toLowerCase().replace(/_/g, " ")}
    </span>
  );
}
