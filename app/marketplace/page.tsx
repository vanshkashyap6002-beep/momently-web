"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MarketplaceSearch } from "@/components/marketplace/marketplace-search";
import { AiRecommendButton } from "@/components/marketplace/ai-recommend-button";
import {
  FiltersSidebar,
  emptyFilters,
  type MarketplaceFilters,
} from "@/components/marketplace/filters-sidebar";
import { TemplateGrid } from "@/components/marketplace/template-grid";
import { marketplaceTemplates, filterOptions } from "@/lib/marketplace-data";

function priceMatches(price: number, labels: string[]): boolean {
  if (labels.length === 0) return true;
  return labels.some((label) => {
    const range = filterOptions.price.find((p) => p.label === label);
    if (!range) return false;
    return price >= range.min && price <= range.max;
  });
}

export default function MarketplacePage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<MarketplaceFilters>(emptyFilters);
  const [recommendedOnly, setRecommendedOnly] = useState(false);

  const filtered = useMemo(() => {
    let results = marketplaceTemplates.filter((t) => {
      const matchesQuery =
        query.trim() === "" ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.occasion.toLowerCase().includes(query.toLowerCase()) ||
        t.creator.name.toLowerCase().includes(query.toLowerCase());

      const matchesOccasion =
        filters.occasion.length === 0 || filters.occasion.includes(t.occasion);
      const matchesTheme = filters.theme.length === 0 || filters.theme.includes(t.theme);
      const matchesStyle = filters.style.length === 0 || filters.style.includes(t.style);
      const matchesMood = filters.mood.length === 0 || filters.mood.includes(t.mood);
      const matchesPrice = priceMatches(t.price, filters.price);

      return (
        matchesQuery &&
        matchesOccasion &&
        matchesTheme &&
        matchesStyle &&
        matchesMood &&
        matchesPrice
      );
    });

    if (recommendedOnly) {
      // Dummy "AI recommendation" — surfaces the most-liked templates first.
      results = [...results].sort((a, b) => b.likes - a.likes).slice(0, 8);
    }

    return results;
  }, [query, filters, recommendedOnly]);

  function handleResetFilters() {
    setFilters(emptyFilters);
    setQuery("");
    setRecommendedOnly(false);
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-page">
          <p className="eyebrow">Marketplace</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest max-w-lg">
            Find the template that already feels like your memory.
          </h1>

          <div className="mt-10 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <MarketplaceSearch value={query} onChange={setQuery} />
            </div>
            <AiRecommendButton onRecommend={() => setRecommendedOnly(true)} />
          </div>

          {recommendedOnly && (
            <button
              onClick={() => setRecommendedOnly(false)}
              className="mt-4 text-xs text-love dark:text-blush hover:underline"
            >
              Showing AI recommendations — clear
            </button>
          )}

          <div className="mt-12 grid md:grid-cols-[240px_1fr] gap-10">
            <FiltersSidebar filters={filters} setFilters={setFilters} />
            <TemplateGrid templates={filtered} onResetFilters={handleResetFilters} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
