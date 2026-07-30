"use client";

import { useState } from "react";
import { PanelLeft, MonitorPlay, SlidersHorizontal } from "lucide-react";
import { StudioNavbar } from "./StudioNavbar";
import { LeftSidebar } from "./Sidebar/LeftSidebar";
import { Toolbar } from "./Canvas/Toolbar";
import { MemoryPreview } from "./Canvas/MemoryPreview";
import { PreviewOverlay } from "./Canvas/PreviewOverlay";
import { RightPanel } from "./RightPanel/RightPanel";
import { cn } from "@/lib/utils";

type MobileTab = "edit" | "canvas" | "settings";

const mobileTabs: { id: MobileTab; label: string; icon: typeof PanelLeft }[] = [
  { id: "edit", label: "Edit", icon: PanelLeft },
  { id: "canvas", label: "Canvas", icon: MonitorPlay },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
];

export function MemoryStudio() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("canvas");
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-paper dark:bg-ink">
      <StudioNavbar onPreview={() => setPreviewOpen(true)} />

      <div className="flex-1 min-h-0 grid md:grid-cols-[20%_60%_20%] lg:grid-cols-[280px_1fr_280px]">
        {/* Left sidebar */}
        <div
          className={cn(
            "border-r border-ink/10 dark:border-paper/10 min-h-0 overflow-hidden md:block",
            mobileTab === "edit" ? "block" : "hidden"
          )}
        >
          <LeftSidebar />
        </div>

        {/* Center canvas */}
        <div
          className={cn(
            "min-h-0 flex flex-col md:flex",
            mobileTab === "canvas" ? "flex" : "hidden"
          )}
        >
          <Toolbar onPreview={() => setPreviewOpen(true)} />
          <div className="flex-1 overflow-y-auto bg-blush/10 dark:bg-ink-soft/30 p-4 md:p-8">
            <MemoryPreview />
          </div>
        </div>

        {/* Right settings panel */}
        <div
          className={cn(
            "border-l border-ink/10 dark:border-paper/10 min-h-0 overflow-hidden md:block",
            mobileTab === "settings" ? "block" : "hidden"
          )}
        >
          <RightPanel />
        </div>
      </div>

      {/* Mobile tab switcher */}
      <nav className="md:hidden flex items-center border-t border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink">
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              mobileTab === tab.id
                ? "text-love dark:text-blush"
                : "text-ink/50 dark:text-paper/50"
            )}
            aria-current={mobileTab === tab.id}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      <PreviewOverlay open={previewOpen} onClose={() => setPreviewOpen(false)} />
    </div>
  );
}
