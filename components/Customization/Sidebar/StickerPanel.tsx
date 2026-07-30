"use client";

import { Heart, Cake, Flower2, Gem, Sparkle, PartyPopper, Cat, HeartHandshake } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import type { StickerKind } from "@/types/studio";

export const stickerIconMap: Record<StickerKind, typeof Heart> = {
  heart: Heart,
  cake: Cake,
  flower: Flower2,
  ring: Gem,
  stars: Sparkle,
  confetti: PartyPopper,
  cat: Cat,
  love: HeartHandshake,
};

const stickers: { kind: StickerKind; label: string }[] = [
  { kind: "heart", label: "Heart" },
  { kind: "cake", label: "Cake" },
  { kind: "flower", label: "Flower" },
  { kind: "ring", label: "Ring" },
  { kind: "stars", label: "Stars" },
  { kind: "confetti", label: "Confetti" },
  { kind: "cat", label: "Cats" },
  { kind: "love", label: "Love Icons" },
];

export function StickerPanel() {
  const { addSticker } = useMemoryStudio();

  return (
    <div className="grid grid-cols-4 gap-2">
      {stickers.map(({ kind, label }) => {
        const Icon = stickerIconMap[kind];
        return (
          <button
            key={kind}
            onClick={() => addSticker(kind)}
            title={`Add ${label}`}
            className="aspect-square rounded-lg border border-ink/10 dark:border-paper/10 flex flex-col items-center justify-center gap-1 text-ink/60 dark:text-paper/60 hover:border-love/40 hover:text-love dark:hover:text-blush hover:bg-love/5 transition-colors"
          >
            <Icon className="h-4 w-4" />
            <span className="text-[9px] leading-none text-center px-0.5">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
