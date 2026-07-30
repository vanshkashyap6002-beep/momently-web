"use client";

import { filterOptions } from "@/lib/marketplace-data";
import { FilterGroup } from "./filter-group";

export interface MarketplaceFilters {
  occasion: string[];
  price: string[];
  theme: string[];
  style: string[];
  mood: string[];
}

export const emptyFilters: MarketplaceFilters = {
  occasion: [],
  price: [],
  theme: [],
  style: [],
  mood: [],
};

export function FiltersSidebar({
  filters,
  setFilters,
}: {
  filters: MarketplaceFilters;
  setFilters: (filters: MarketplaceFilters) => void;
}) {
  function toggle(key: keyof MarketplaceFilters, value: string) {
    const current = filters[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ ...filters, [key]: next });
  }

  const activeCount = Object.values(filters).reduce((sum, v) => sum + v.length, 0);

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-lg text-ink dark:text-paper">Filters</h2>
        {activeCount > 0 && (
          <button
            onClick={() => setFilters(emptyFilters)}
            className="text-xs text-love dark:text-blush hover:underline"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      <FilterGroup
        title="Occasion"
        options={filterOptions.occasion}
        selected={filters.occasion}
        onToggle={(v) => toggle("occasion", v)}
      />
      <FilterGroup
        title="Price"
        options={filterOptions.price.map((p) => p.label)}
        selected={filters.price}
        onToggle={(v) => toggle("price", v)}
      />
      <FilterGroup
        title="Theme"
        options={filterOptions.theme}
        selected={filters.theme}
        onToggle={(v) => toggle("theme", v)}
      />
      <FilterGroup
        title="Style"
        options={filterOptions.style}
        selected={filters.style}
        onToggle={(v) => toggle("style", v)}
      />
      <FilterGroup
        title="Mood"
        options={filterOptions.mood}
        selected={filters.mood}
        onToggle={(v) => toggle("mood", v)}
        defaultOpen={false}
      />
    </aside>
  );
}
