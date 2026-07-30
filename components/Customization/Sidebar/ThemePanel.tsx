"use client";

import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { cn } from "@/lib/utils";
import type {
  ColorScheme,
  FontPairing,
  ButtonStyle,
  AnimationStyle,
  BackgroundStyle,
} from "@/types/studio";

const colorOptions: { id: ColorScheme; label: string; swatch: string }[] = [
  { id: "deep-love", label: "Deep Love", swatch: "bg-[#7A1E2B]" },
  { id: "midnight-gold", label: "Midnight Gold", swatch: "bg-[#B8964F]" },
  { id: "blush-cream", label: "Blush Cream", swatch: "bg-[#E4B9BE]" },
  { id: "emerald-noir", label: "Emerald Noir", swatch: "bg-[#2F4F4F]" },
];

const fontOptions: { id: FontPairing; label: string }[] = [
  { id: "playfair-inter", label: "Playfair + Inter" },
  { id: "cormorant-work", label: "Cormorant + Work Sans" },
  { id: "fraunces-manrope", label: "Fraunces + Manrope" },
];

const buttonStyles: { id: ButtonStyle; label: string }[] = [
  { id: "solid", label: "Solid" },
  { id: "outline", label: "Outline" },
  { id: "pill-glow", label: "Pill Glow" },
];

const animationStyles: { id: AnimationStyle; label: string }[] = [
  { id: "gentle", label: "Gentle" },
  { id: "cinematic", label: "Cinematic" },
  { id: "playful", label: "Playful" },
];

const backgroundStyles: { id: BackgroundStyle; label: string }[] = [
  { id: "paper", label: "Paper" },
  { id: "gradient", label: "Gradient" },
  { id: "photo-blur", label: "Photo Blur" },
];

function OptionRow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-ink/60 dark:text-paper/60 mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function ThemePanel() {
  const { state, updateTheme } = useMemoryStudio();
  const { theme } = state;

  return (
    <div className="space-y-5">
      <OptionRow title="Colors">
        {colorOptions.map((c) => (
          <button
            key={c.id}
            onClick={() => updateTheme({ colorScheme: c.id })}
            aria-label={c.label}
            title={c.label}
            className={cn(
              "h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-paper dark:ring-offset-ink transition-all",
              c.swatch,
              theme.colorScheme === c.id ? "ring-love dark:ring-blush" : "ring-transparent"
            )}
          />
        ))}
      </OptionRow>

      <OptionRow title="Fonts">
        {fontOptions.map((f) => (
          <button
            key={f.id}
            onClick={() => updateTheme({ font: f.id })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
              theme.font === f.id
                ? "bg-love border-love text-paper"
                : "border-ink/15 dark:border-paper/20 text-ink/65 dark:text-paper/65 hover:border-love/40"
            )}
          >
            {f.label}
          </button>
        ))}
      </OptionRow>

      <OptionRow title="Button style">
        {buttonStyles.map((b) => (
          <button
            key={b.id}
            onClick={() => updateTheme({ buttonStyle: b.id })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
              theme.buttonStyle === b.id
                ? "bg-love border-love text-paper"
                : "border-ink/15 dark:border-paper/20 text-ink/65 dark:text-paper/65 hover:border-love/40"
            )}
          >
            {b.label}
          </button>
        ))}
      </OptionRow>

      <OptionRow title="Animation style">
        {animationStyles.map((a) => (
          <button
            key={a.id}
            onClick={() => updateTheme({ animationStyle: a.id })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
              theme.animationStyle === a.id
                ? "bg-love border-love text-paper"
                : "border-ink/15 dark:border-paper/20 text-ink/65 dark:text-paper/65 hover:border-love/40"
            )}
          >
            {a.label}
          </button>
        ))}
      </OptionRow>

      <OptionRow title="Background">
        {backgroundStyles.map((bg) => (
          <button
            key={bg.id}
            onClick={() => updateTheme({ background: bg.id })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] transition-colors",
              theme.background === bg.id
                ? "bg-love border-love text-paper"
                : "border-ink/15 dark:border-paper/20 text-ink/65 dark:text-paper/65 hover:border-love/40"
            )}
          >
            {bg.label}
          </button>
        ))}
      </OptionRow>
    </div>
  );
}
