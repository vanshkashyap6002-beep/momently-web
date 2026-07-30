import Link from "next/link";
import { Frame } from "lucide-react";

export function NotFoundState({
  title = "This template doesn't exist.",
  description = "It may have been removed, renamed, or the link is off by a letter.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-32 px-6">
      <div className="h-16 w-16 rounded-full bg-blush/40 dark:bg-ink-soft flex items-center justify-center">
        <Frame className="h-7 w-7 text-love dark:text-blush" />
      </div>
      <p className="mt-6 font-display text-5xl text-love/20 dark:text-blush/20">404</p>
      <h1 className="mt-2 font-display text-2xl text-ink dark:text-paper">{title}</h1>
      <p className="mt-2 text-sm text-ink/55 dark:text-paper/55 max-w-sm">{description}</p>
      <Link
        href="/marketplace"
        className="mt-8 rounded-full bg-love px-6 py-3 text-sm font-medium text-paper hover:bg-love-dark transition-colors"
      >
        Back to Marketplace
      </Link>
    </div>
  );
}
