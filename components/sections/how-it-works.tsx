"use client";

import { motion } from "framer-motion";
import { howItWorks } from "@/lib/data";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-blush/20 dark:bg-ink-soft/40">
      <div className="container-page">
        <p className="eyebrow">How it Works</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest max-w-lg">
          From occasion to link, in four steps.
        </h2>

        <div className="relative mt-20 max-w-2xl mx-auto md:mx-0">
          {/* Vertical line that draws itself as the section scrolls into view */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            style={{ originY: 0 }}
            className="absolute left-[15px] top-2 bottom-2 w-px bg-love/30 dark:bg-blush/30"
          />

          <ol className="space-y-16">
            {howItWorks.map((s, i) => (
              <motion.li
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative pl-14"
              >
                <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-love text-paper text-xs font-medium">
                  {s.step}
                </span>
                <h3 className="font-display text-xl text-ink dark:text-paper">{s.title}</h3>
                <p className="mt-2 text-sm text-ink/60 dark:text-paper/60 leading-relaxed max-w-md">
                  {s.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
