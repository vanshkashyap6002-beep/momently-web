"use client";

import { motion } from "framer-motion";
import { whyChooseUs } from "@/lib/data";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 16 } },
};

export function WhyChooseUs() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="eyebrow"
        >
          Why Momently
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-3 font-display text-3xl md:text-4xl tracking-tightest max-w-lg"
        >
          Built for the moment, not the medium.
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {whyChooseUs.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-7 hover:border-love/30 dark:hover:border-blush/30 transition-colors"
            >
              <h3 className="font-display text-lg text-ink dark:text-paper">{f.title}</h3>
              <p className="mt-3 text-sm text-ink/60 dark:text-paper/60 leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
