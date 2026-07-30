"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { pricingPlans } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-blush/20 dark:bg-ink-soft/40">
      <div className="container-page">
        <p className="eyebrow text-center">Pricing</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest text-center">
          Pay for the memory, not the tool.
        </h2>

        <div className="mt-16 grid md:grid-cols-3 gap-6 items-stretch">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "rounded-2xl p-8 flex flex-col",
                plan.highlighted
                  ? "bg-love text-paper shadow-card md:-translate-y-3"
                  : "bg-paper dark:bg-ink-soft border border-ink/10 dark:border-paper/10"
              )}
            >
              <h3 className="font-display text-xl">{plan.name}</h3>
              <p
                className={cn(
                  "mt-2 text-sm",
                  plan.highlighted ? "text-paper/70" : "text-ink/55 dark:text-paper/55"
                )}
              >
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-3xl">{plan.price}</span>
                <span className={cn("text-xs", plan.highlighted ? "text-paper/60" : "text-ink/50 dark:text-paper/50")}>
                  {plan.cadence}
                </span>
              </div>

              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className={plan.highlighted ? "text-paper/90" : "text-ink/70 dark:text-paper/70"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={cn(
                  "mt-8 rounded-full py-3 text-sm font-medium transition-colors",
                  plan.highlighted
                    ? "bg-paper text-love hover:bg-blush"
                    : "bg-ink text-paper dark:bg-paper dark:text-ink hover:opacity-90"
                )}
              >
                Choose {plan.name}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
