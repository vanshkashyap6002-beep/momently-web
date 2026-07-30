"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FilterGroup({
  title,
  options,
  selected,
  onToggle,
  defaultOpen = true,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-ink/10 dark:border-paper/10 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm font-medium text-ink dark:text-paper"
      >
        {title}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform text-ink/40 dark:text-paper/40", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((opt) => {
            const isActive = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                  isActive
                    ? "bg-love border-love text-paper"
                    : "border-ink/15 dark:border-paper/20 text-ink/65 dark:text-paper/65 hover:border-love/40"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
