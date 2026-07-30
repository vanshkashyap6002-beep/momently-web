"use client";

import { cn } from "@/lib/utils";

interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = "%",
  onChange,
  className,
}: SliderProps) {
  return (
    <label className={cn("block", className)}>
      <span className="flex items-center justify-between text-xs text-ink/60 dark:text-paper/60 mb-1.5">
        <span>{label}</span>
        <span className="tabular-nums text-ink/80 dark:text-paper/80">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-love dark:accent-blush h-1.5 rounded-full cursor-pointer"
        aria-label={label}
      />
    </label>
  );
}
