"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((a) => (a + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-24 md:py-32">
      <div className="container-page">
        <p className="eyebrow text-center">Testimonials</p>
        <h2 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest text-center">
          Read the way it landed.
        </h2>

        <div className="relative mt-14 max-w-2xl mx-auto h-[220px] md:h-[190px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonials[active].id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-3xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 backdrop-blur-sm shadow-card p-8 md:p-10 flex flex-col justify-center text-center"
            >
              <p className="font-display text-lg md:text-xl text-ink dark:text-paper leading-relaxed">
                &ldquo;{testimonials[active].quote}&rdquo;
              </p>
              <p className="mt-5 text-sm text-ink/55 dark:text-paper/55">
                {testimonials[active].name} &middot; {testimonials[active].occasion}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActive(i)}
              aria-label={`Show testimonial from ${t.name}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-6 bg-love dark:bg-blush" : "w-1.5 bg-ink/20 dark:bg-paper/20"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
