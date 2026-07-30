"use client";

import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
} from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { cn } from "@/lib/utils";
import type { DeviceMode } from "@/types/studio";

const devices: { id: DeviceMode; icon: typeof Monitor; label: string }[] = [
  { id: "desktop", icon: Monitor, label: "Desktop" },
  { id: "tablet", icon: Tablet, label: "Tablet" },
  { id: "mobile", icon: Smartphone, label: "Mobile" },
];

function ToolbarIconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Undo2;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="h-9 w-9 rounded-lg flex items-center justify-center text-ink/60 dark:text-paper/60 hover:bg-ink/5 dark:hover:bg-paper/10 hover:text-love dark:hover:text-blush disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink/60 transition-colors"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function Toolbar({ onPreview }: { onPreview: () => void }) {
  const {
    state,
    canUndo,
    canRedo,
    undo,
    redo,
    duplicateSelected,
    deleteSelected,
    setZoom,
    setDevice,
  } = useMemoryStudio();

  const hasSelection = Boolean(state.selectedItemId) && state.selectedItemType !== "cta";

  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/10 dark:border-paper/10 bg-paper/80 dark:bg-ink-soft/80 backdrop-blur-sm px-4 py-2">
      <div className="flex items-center gap-1">
        <ToolbarIconButton icon={Undo2} label="Undo" onClick={undo} disabled={!canUndo} />
        <ToolbarIconButton icon={Redo2} label="Redo" onClick={redo} disabled={!canRedo} />
        <div className="mx-1.5 h-5 w-px bg-ink/10 dark:bg-paper/10" />
        <ToolbarIconButton
          icon={Copy}
          label="Duplicate"
          onClick={duplicateSelected}
          disabled={!hasSelection}
        />
        <ToolbarIconButton
          icon={Trash2}
          label="Delete"
          onClick={deleteSelected}
          disabled={!hasSelection}
        />
      </div>

      <div className="hidden sm:flex items-center gap-1 rounded-full border border-ink/10 dark:border-paper/10 p-0.5">
        {devices.map((d) => (
          <button
            key={d.id}
            onClick={() => setDevice(d.id)}
            aria-label={d.label}
            title={d.label}
            className={cn(
              "h-7 w-7 rounded-full flex items-center justify-center transition-colors",
              state.device === d.id
                ? "bg-love text-paper"
                : "text-ink/50 dark:text-paper/50 hover:text-love dark:hover:text-blush"
            )}
          >
            <d.icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <ToolbarIconButton
          icon={ZoomOut}
          label="Zoom out"
          onClick={() => setZoom(Math.max(50, state.zoom - 10))}
          disabled={state.zoom <= 50}
        />
        <span className="w-10 text-center text-xs tabular-nums text-ink/60 dark:text-paper/60">
          {state.zoom}%
        </span>
        <ToolbarIconButton
          icon={ZoomIn}
          label="Zoom in"
          onClick={() => setZoom(Math.min(150, state.zoom + 10))}
          disabled={state.zoom >= 150}
        />
        <div className="mx-1.5 h-5 w-px bg-ink/10 dark:bg-paper/10" />
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 rounded-full border border-ink/15 dark:border-paper/20 px-3 py-1.5 text-xs font-medium text-ink dark:text-paper hover:border-love/40 hover:text-love dark:hover:text-blush transition-colors"
        >
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
      </div>
    </div>
  );
}
