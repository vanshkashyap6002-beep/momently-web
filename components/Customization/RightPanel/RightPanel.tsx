"use client";

import { CheckCircle2, Circle, Monitor } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { SettingsPanel } from "./SettingsPanel";
import { cn } from "@/lib/utils";

export function RightPanel() {
  const { state } = useMemoryStudio();

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="border-b border-ink/10 dark:border-paper/10">
        <p className="px-4 pt-4 pb-2 text-xs font-medium text-ink dark:text-paper">Properties</p>
        <SettingsPanel />
      </div>

      <div className="border-b border-ink/10 dark:border-paper/10 p-4">
        <p className="text-xs font-medium text-ink dark:text-paper mb-3">Preview settings</p>
        <div className="flex items-center gap-2 text-xs text-ink/60 dark:text-paper/60">
          <Monitor className="h-3.5 w-3.5" />
          Viewing on <span className="capitalize font-medium text-ink dark:text-paper">{state.device}</span>
          {" "}at {state.zoom}% zoom
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-medium text-ink dark:text-paper mb-3">Publish status</p>
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
            state.publishStatus === "published"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-ink/5 dark:bg-paper/10 text-ink/60 dark:text-paper/60"
          )}
        >
          {state.publishStatus === "published" ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <Circle className="h-3.5 w-3.5" />
          )}
          {state.publishStatus === "published" ? "Published" : "Draft — not published yet"}
        </div>
      </div>
    </div>
  );
}
