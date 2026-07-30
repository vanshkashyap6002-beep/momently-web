"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { heroTemplates } from "@/lib/data";
import type { TemplateAccent } from "@/types";

const accentStyles: Record<TemplateAccent, { bg: string; text: string; ring: string }> = {
  birthday: { bg: "bg-template-birthday", text: "text-template-birthday", ring: "ring-template-birthday/30" },
  anniversary: { bg: "bg-template-anniversary", text: "text-template-anniversary", ring: "ring-template-anniversary/30" },
  proposal: { bg: "bg-template-proposal", text: "text-template-proposal", ring: "ring-template-proposal/30" },
  wedding: { bg: "bg-template-wedding", text: "text-template-wedding", ring: "ring-template-wedding/30" },
};

// Base stacked position — cards fan out from here on load, then settle
// with a small residual offset so the stack still reads as a stack.
const layout = [
  { x: -70, y: 40, rotate: -10, z: 10 },
  { x: 40, y: -30, rotate: 6, z: 20 },
  { x: -30, y: -70, rotate: -4, z: 30 },
  { x: 60, y: 20, rotate: 9, z: 40 },
];

function Card({
  index,
  title,
  accent,
  description,
}: {
  index: number;
  title: string;
  accent: TemplateAccent;
  description: string;
}) {
  const pos = layout[index];
  const styles = accentStyles[accent];

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 w-[220px] h-[220px] md:w-[260px] md:h-[260px] -ml-[110px] -mt-[110px] md:-ml-[130px] md:-mt-[130px]"
      style={{ zIndex: pos.z }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.9 }}
      animate={{ x: pos.x, y: pos.y, rotate: pos.rotate, opacity: 1, scale: 1 }}
      transition={{
        delay: 0.25 + index * 0.18,
        type: "spring",
        stiffness: 90,
        damping: 14,
        mass: 1,
      }}
    >
      <div
        className={`relative w-full h-full rounded-2xl bg-paper dark:bg-ink-soft ring-1 ${styles.ring} shadow-card p-6 flex flex-col justify-between overflow-hidden`}
      >
        <div className={`h-1.5 w-10 rounded-full ${styles.bg}`} />
        <div>
          <p className={`text-xs uppercase tracking-[0.18em] font-medium ${styles.text}`}>{title}</p>
          <p className="mt-2 text-sm text-ink/60 dark:text-paper/60 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function HeroCardStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 120,
    damping: 20,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[420px] md:h-[520px] [perspective:1200px]"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full"
      >
        {heroTemplates.map((template, i) => (
          <Card
            key={template.id}
            index={i}
            title={template.name}
            accent={template.accent}
            description={template.description}
          />
        ))}
      </motion.div>
    </div>
  );
}
