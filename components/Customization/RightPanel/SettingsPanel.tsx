"use client";

import { Layers } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { Slider } from "@/components/ui/slider";
import type { ElementProperties } from "@/types/studio";

const labelByType: Record<string, string> = {
  photo: "Photo",
  video: "Video",
  sticker: "Sticker",
  timeline: "Timeline card",
  cta: "CTA button",
};

export function SettingsPanel() {
  const { state, updateProperties, getProperties } = useMemoryStudio();
  const { selectedItemId, selectedItemType } = state;

  if (!selectedItemId || !selectedItemType) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full py-16 px-4">
        <div className="h-11 w-11 rounded-full bg-blush/30 dark:bg-ink-soft flex items-center justify-center mb-3">
          <Layers className="h-[18px] w-[18px] text-love dark:text-blush" />
        </div>
        <p className="text-xs text-ink/50 dark:text-paper/50 max-w-[160px]">
          Select a photo, sticker, or timeline card on the canvas to edit its properties.
        </p>
      </div>
    );
  }

  const props = getProperties(selectedItemId);

  function patch(key: keyof ElementProperties, value: number) {
    updateProperties(selectedItemId as string, { [key]: value });
  }

  return (
    <div className="p-4 space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-ink/40 dark:text-paper/40 mb-1">
          Selected item
        </p>
        <p className="text-sm font-medium text-ink dark:text-paper">
          {labelByType[selectedItemType] ?? "Element"}
        </p>
      </div>

      <Slider label="Opacity" value={props.opacity} min={10} max={100} onChange={(v) => patch("opacity", v)} />
      <Slider label="Size" value={props.size} min={50} max={150} onChange={(v) => patch("size", v)} />
      <Slider label="Padding" value={props.padding} min={0} max={40} unit="px" onChange={(v) => patch("padding", v)} />
      <Slider
        label="Border radius"
        value={props.borderRadius}
        min={0}
        max={32}
        unit="px"
        onChange={(v) => patch("borderRadius", v)}
      />
      <Slider label="Shadow" value={props.shadow} min={0} max={100} onChange={(v) => patch("shadow", v)} />
      <Slider
        label="Animation speed"
        value={props.animationSpeed}
        min={50}
        max={200}
        onChange={(v) => patch("animationSpeed", v)}
      />
    </div>
  );
}
