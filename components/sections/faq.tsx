"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/lib/data";

export function Faq() {
  const [open, setOpen] = useState<string | null>(faqItems[0]?.id ?? null);

  return (
    <section className="py-24 md:py-32">
      <div className="container-page max-w-2xl">
        <p className="eyebrow">FAQ</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest">
          Questions, answered plainly.
        </h2>

        <div className="mt-12 divide-y divide-ink/10 dark:divide-paper/10">
          {faqItems.map((item) => {
            const isOpen = open === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="font-display text-base md:text-lg text-ink dark:text-paper">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-love dark:text-blush shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm text-ink/60 dark:text-paper/60 leading-relaxed">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
