"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { MarketplaceTemplate, TemplateAccent } from "@/types";
import { cn } from "@/lib/utils";

const accentText: Record<TemplateAccent, string> = {
  birthday: "text-template-birthday",
  anniversary: "text-template-anniversary",
  proposal: "text-template-proposal",
  wedding: "text-template-wedding",
};

const accentBg: Record<TemplateAccent, string> = {
  birthday: "bg-template-birthday",
  anniversary: "bg-template-anniversary",
  proposal: "bg-template-proposal",
  wedding: "bg-template-wedding",
};

export function TemplateCard({ template }: { template: MarketplaceTemplate }) {
  const { name, occasion, price, creator, previewImageSeed, accent, slug, style } = template;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft overflow-hidden shadow-sm hover:shadow-card transition-shadow"
    >
      {/* Large preview */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-blush/30 dark:bg-ink/40">
        <Image
          src={`https://picsum.photos/seed/${previewImageSeed}/640/480`}
          alt={`${name} preview`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <span
          className={cn(
            "absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-medium text-paper",
            accentBg[accent]
          )}
        >
          {occasion}
        </span>

        <span className="absolute top-3 right-3 rounded-full bg-paper/90 dark:bg-ink/80 px-2.5 py-1 text-[11px] font-medium text-ink dark:text-paper">
          {price === 0 ? "Free" : `₹${price}`}
        </span>

        {/* Hover actions */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Link
            href={`/marketplace/${slug}`}
            className="flex-1 rounded-full bg-paper/95 dark:bg-ink/90 text-ink dark:text-paper text-xs font-medium py-2 text-center hover:bg-paper transition-colors"
          >
            Preview
          </Link>
          <Link
            href={`/customize/${slug}`}
            className="flex-1 rounded-full bg-love text-paper text-xs font-medium py-2 text-center hover:bg-love-dark transition-colors"
          >
            Use Template
          </Link>
        </div>
      </div>

      {/* Meta */}
      <div className="p-4">
        <h3 className={cn("font-display text-base text-ink dark:text-paper truncate")}>{name}</h3>

        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-ink/55 dark:text-paper/55">
          <span className="flex items-center gap-2 min-w-0">
            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", accentBg[accent])} />
            <span className="truncate">{creator.name}</span>
          </span>
          <span className={cn("shrink-0 font-medium", accentText[accent])}>{style}</span>
        </div>
      </div>
    </motion.div>
  );
}
