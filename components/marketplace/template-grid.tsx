"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MarketplaceTemplate } from "@/types";
import { TemplateCard } from "./template-card";
import { TemplateCardSkeleton } from "./template-card-skeleton";
import { EmptyState } from "./empty-state";

const PAGE_SIZE = 12;

export function TemplateGrid({
  templates,
  onResetFilters,
}: {
  templates: MarketplaceTemplate[];
  onResetFilters: () => void;
}) {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset pagination whenever the underlying (filtered) template list changes
  useEffect(() => {
    setPage(1);
  }, [templates]);

  const totalPages = Math.max(1, Math.ceil(templates.length / PAGE_SIZE));
  const visible = useMemo(() => templates.slice(0, page * PAGE_SIZE), [templates, page]);
  const hasMore = page < totalPages;

  function loadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    // Simulated network delay — no backend, dummy JSON only
    setTimeout(() => {
      setPage((p) => p + 1);
      setLoadingMore(false);
    }, 700);
  }

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, templates]);

  if (templates.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState onReset={onResetFilters} />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {visible.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </AnimatePresence>

        {loadingMore &&
          Array.from({ length: Math.min(4, PAGE_SIZE) }).map((_, i) => (
            <TemplateCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={sentinelRef} className="h-1 w-full" />

      <div className="mt-10 flex flex-col items-center gap-4">
        <p className="text-xs text-ink/45 dark:text-paper/45">
          Showing {visible.length} of {templates.length} templates &middot; page {page} of {totalPages}
        </p>

        {hasMore && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-ink/15 dark:border-paper/20 px-6 py-2.5 text-sm font-medium text-ink dark:text-paper hover:border-love/40 hover:text-love dark:hover:text-blush transition-colors disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </motion.button>
        )}
      </div>
    </div>
  );
}
