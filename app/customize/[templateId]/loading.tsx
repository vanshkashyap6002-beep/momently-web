import { Loader2 } from "lucide-react";

export default function StudioLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-paper dark:bg-ink">
      <div className="flex flex-col items-center gap-3 text-ink/50 dark:text-paper/50">
        <Loader2 className="h-6 w-6 animate-spin text-love dark:text-blush" />
        <p className="text-sm">Loading your memory studio…</p>
      </div>
    </div>
  );
}
