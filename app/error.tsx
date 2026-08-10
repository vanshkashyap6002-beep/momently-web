"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper dark:bg-ink px-6 text-center">
      <p className="font-display text-2xl text-ink dark:text-paper">Something went wrong.</p>
      <p className="mt-2 text-sm text-ink/55 dark:text-paper/55 max-w-sm">
        That&apos;s on us, not you — please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 flex items-center gap-2 rounded-full bg-love px-6 py-3 text-sm font-medium text-paper hover:bg-love-dark transition-colors"
      >
        <RotateCcw className="h-4 w-4" /> Try again
      </button>
    </div>
  );
}
