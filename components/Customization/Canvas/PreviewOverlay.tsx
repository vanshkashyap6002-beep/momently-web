"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { MemoryPreview } from "./MemoryPreview";

export function PreviewOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-10 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl"
          >
            <button
              onClick={onClose}
              aria-label="Close preview"
              className="mb-3 ml-auto flex items-center gap-1.5 rounded-full bg-paper/90 dark:bg-ink-soft/90 px-4 py-2 text-xs font-medium text-ink dark:text-paper hover:bg-paper transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Close preview
            </button>
            <MemoryPreview />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
