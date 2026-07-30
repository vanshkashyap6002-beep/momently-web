"use client";

import { SearchX } from "lucide-react";
import { motion } from "framer-motion";

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-24 px-6 col-span-full"
    >
      <div className="h-14 w-14 rounded-full bg-blush/40 dark:bg-ink-soft flex items-center justify-center">
        <SearchX className="h-6 w-6 text-love dark:text-blush" />
      </div>
      <h3 className="mt-6 font-display text-xl text-ink dark:text-paper">
        No templates match those filters.
      </h3>
      <p className="mt-2 text-sm text-ink/55 dark:text-paper/55 max-w-sm">
        Try widening your search, clearing a filter, or let Momently recommend
        something close to what you had in mind.
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-full border border-ink/15 dark:border-paper/20 px-6 py-2.5 text-sm font-medium text-ink dark:text-paper hover:border-love/40 hover:text-love dark:hover:text-blush transition-colors"
      >
        Clear all filters
      </button>
    </motion.div>
  );
}
