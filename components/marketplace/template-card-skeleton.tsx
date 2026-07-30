export function TemplateCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft overflow-hidden animate-pulse">
      <div className="aspect-[4/3] w-full bg-ink/10 dark:bg-paper/10" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 rounded bg-ink/10 dark:bg-paper/10" />
        <div className="h-3 w-1/3 rounded bg-ink/10 dark:bg-paper/10" />
        <div className="flex gap-4 pt-1">
          <div className="h-3 w-8 rounded bg-ink/10 dark:bg-paper/10" />
          <div className="h-3 w-8 rounded bg-ink/10 dark:bg-paper/10" />
        </div>
      </div>
    </div>
  );
}
