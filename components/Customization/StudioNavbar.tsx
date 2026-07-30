"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Eye, Rocket, ChevronLeft, Check, Loader2 } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { saveDraft, publishProject } from "@/app/actions/project.actions";
import { toSaveProjectPayload } from "@/lib/studio-payload";

export function StudioNavbar({ onPreview }: { onPreview: () => void }) {
  const router = useRouter();
  const { state, setPublishStatus } = useMemoryStudio();
  const [savedFlash, setSavedFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    const result = await saveDraft(toSaveProjectPayload(state));
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPublishStatus("draft");
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  }

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    const result = await publishProject(toSaveProjectPayload(state));
    setPublishing(false);

    if (!result.ok) {
      // Content was still saved as DRAFT server-side even though publishing
      // was blocked — send the user to Checkout to unlock it instead of
      // just showing an error with no way forward.
      if (result.code === "PAYMENT_REQUIRED") {
        router.push(`/checkout/${state.projectId}`);
        return;
      }
      setError(result.error);
      return;
    }

    setPublishStatus("published");
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/marketplace"
          aria-label="Back to Marketplace"
          className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-ink/50 dark:text-paper/50 hover:bg-ink/5 dark:hover:bg-paper/10 hover:text-love dark:hover:text-blush transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="font-display text-lg text-love dark:text-blush shrink-0">Momently</span>
        <span className="hidden sm:inline text-ink/20 dark:text-paper/20">/</span>
        <span className="hidden sm:inline text-sm text-ink/70 dark:text-paper/70 truncate">
          {state.templateName}
        </span>
        {error && (
          <span className="hidden lg:inline text-xs text-love dark:text-blush truncate">{error}</span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleSaveDraft}
          disabled={saving}
          className="hidden sm:flex items-center gap-1.5 rounded-full border border-ink/15 dark:border-paper/20 px-4 py-2 text-xs font-medium text-ink dark:text-paper hover:border-love/40 hover:text-love dark:hover:text-blush transition-colors disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : savedFlash ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saving ? "Saving…" : savedFlash ? "Saved" : "Save Draft"}
        </button>

        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 rounded-full border border-ink/15 dark:border-paper/20 px-4 py-2 text-xs font-medium text-ink dark:text-paper hover:border-love/40 hover:text-love dark:hover:text-blush transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </button>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center gap-1.5 rounded-full bg-love px-4 py-2 text-xs font-medium text-paper shadow-card hover:bg-love-dark transition-colors disabled:opacity-60"
        >
          {publishing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Rocket className="h-3.5 w-3.5" />
          )}
          {publishing ? "Publishing…" : "Publish"}
        </motion.button>

        <span className="ml-1 h-8 w-8 rounded-full bg-blush/60 dark:bg-ink-soft flex items-center justify-center text-xs font-medium text-love dark:text-blush">
          V
        </span>
      </div>
    </header>
  );
}
