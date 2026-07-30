"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";

export function TimelineEditor() {
  const { state, addTimelineEvent, removeTimelineEvent, updateTimelineEvent, reorderTimeline, selectItem } =
    useMemoryStudio();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= state.timeline.length) return;
    reorderTimeline(index, target);
  }

  return (
    <div>
      <button
        onClick={addTimelineEvent}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink/20 dark:border-paper/25 text-xs font-medium text-ink/70 dark:text-paper/70 py-2.5 hover:border-love/40 hover:text-love dark:hover:text-blush transition-colors mb-3"
      >
        <Plus className="h-3.5 w-3.5" /> Add event
      </button>

      <ol className="space-y-2">
        {state.timeline.map((event, index) => (
          <motion.li
            key={event.id}
            layout
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) reorderTimeline(dragIndex, index);
              setDragIndex(null);
            }}
            onClick={() => selectItem(event.id, "timeline")}
            className={`group rounded-lg border p-2.5 cursor-pointer transition-colors ${
              state.selectedItemId === event.id
                ? "border-love/50 bg-love/5 dark:border-blush/50 dark:bg-blush/5"
                : "border-ink/10 dark:border-paper/10 hover:border-ink/20 dark:hover:border-paper/20"
            }`}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="h-3.5 w-3.5 mt-0.5 text-ink/25 dark:text-paper/25 cursor-grab shrink-0" />
              <div className="flex-1 min-w-0">
                <input
                  value={event.date}
                  onChange={(e) => updateTimelineEvent(event.id, { date: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent text-[11px] font-medium text-love dark:text-blush mb-0.5 focus:outline-none"
                  aria-label="Event date"
                />
                <input
                  value={event.title}
                  onChange={(e) => updateTimelineEvent(event.id, { title: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent text-xs font-medium text-ink dark:text-paper focus:outline-none"
                  aria-label="Event title"
                />
              </div>
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    move(index, -1);
                  }}
                  aria-label="Move up"
                  className="h-5 w-5 flex items-center justify-center text-ink/40 hover:text-love dark:text-paper/40 dark:hover:text-blush"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    move(index, 1);
                  }}
                  aria-label="Move down"
                  className="h-5 w-5 flex items-center justify-center text-ink/40 hover:text-love dark:text-paper/40 dark:hover:text-blush"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTimelineEvent(event.id);
                }}
                aria-label="Delete event"
                className="h-6 w-6 flex items-center justify-center text-ink/40 hover:text-love hover:bg-love/10 dark:text-paper/40 dark:hover:text-blush rounded-full transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
