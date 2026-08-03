import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink/50 dark:text-paper/50">{label}</span>
        <Icon className="h-4 w-4 text-love dark:text-blush" />
      </div>
      <p className="mt-2 font-display text-2xl text-ink dark:text-paper">{value}</p>
    </div>
  );
}
