import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-ink">
      <Loader2 className="h-6 w-6 animate-spin text-love dark:text-blush" />
    </div>
  );
}
