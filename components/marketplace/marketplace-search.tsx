"use client";

import { Search } from "lucide-react";

export function MarketplaceSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-ink/40 dark:text-paper/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search templates — “rooftop proposal”, “50th anniversary”…"
        className="w-full rounded-full border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink-soft py-4 pl-14 pr-5 text-sm md:text-base text-ink dark:text-paper placeholder:text-ink/40 dark:placeholder:text-paper/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-love/30 dark:focus:ring-blush/30 transition-shadow"
        aria-label="Search templates"
      />
    </div>
  );
}
