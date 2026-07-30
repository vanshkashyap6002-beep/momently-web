"use client";

import { Sparkles } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const sharedClasses =
    "w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink px-3 py-2 text-xs text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-love/30 dark:focus:ring-blush/30";

  return (
    <label className="block">
      <span className="block text-xs text-ink/60 dark:text-paper/60 mb-1.5">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={sharedClasses}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} className={sharedClasses} />
      )}
    </label>
  );
}

export function MessagesPanel() {
  const { state, updateMessages } = useMemoryStudio();
  const { messages } = state;

  return (
    <div className="space-y-3">
      <Field label="Title" value={messages.title} onChange={(v) => updateMessages({ title: v })} />
      <Field
        label="Subtitle"
        value={messages.subtitle}
        onChange={(v) => updateMessages({ subtitle: v })}
      />

      <div className="rounded-lg border border-dashed border-love/30 dark:border-blush/30 bg-blush/10 dark:bg-blush/5 p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-medium text-love dark:text-blush mb-1">
          <Sparkles className="h-3.5 w-3.5" /> AI message
        </p>
        <p className="text-[11px] text-ink/55 dark:text-paper/55 leading-relaxed">
          {messages.aiPlaceholder}
        </p>
      </div>

      <Field
        label="Custom text"
        value={messages.customText}
        onChange={(v) => updateMessages({ customText: v })}
        multiline
      />
    </div>
  );
}
