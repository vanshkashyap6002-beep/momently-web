"use client";

import { motion } from "framer-motion";
import { featuredTemplates } from "@/lib/data";
import type { TemplateAccent } from "@/types";

const accentBg: Record<TemplateAccent, string> = {
  birthday: "bg-template-birthday",
  anniversary: "bg-template-anniversary",
  proposal: "bg-template-proposal",
  wedding: "bg-template-wedding",
};

export function FeaturedTemplates() {
  return (
    <section id="marketplace" className="py-24 md:py-32">
      <div className="container-page mb-10 flex items-end justify-between">
        <div>
          <p className="eyebrow">Featured Templates</p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest">
            A shape for every occasion.
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="flex gap-6 px-6 md:px-10 pb-4 w-max">
          {featuredTemplates.map((t, i) => (
            <motion.div
              key={`${t.id}-${i}`}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="group relative w-[260px] shrink-0 rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft overflow-hidden"
            >
              <div className={`h-36 w-full ${accentBg[t.accent]}/15 relative`}>
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${accentBg[t.accent]}/25 blur-2xl`}
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-ink dark:text-paper">{t.name}</h3>
                <p className="mt-2 text-sm text-ink/60 dark:text-paper/60 leading-relaxed">
                  {t.description}
                </p>
                <button className="mt-4 text-xs font-medium text-love dark:text-blush opacity-0 group-hover:opacity-100 transition-opacity">
                  Preview →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
