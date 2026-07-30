"use client";

import { useRef, useState } from "react";
import { Music2, UploadCloud, Loader2 } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { uploadMusic } from "@/app/actions/media.actions";
import { withRetry } from "@/lib/upload-client";

export function MusicSelector() {
  const { state, selectSong, addSong, setVolume, toggleAutoPlay, toggleLoop } = useMemoryStudio();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("audio/")) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", state.projectId);

      const result = await withRetry(() => uploadMusic(formData));

      if (result.ok) {
        addSong({
          id: result.data.id,
          title: result.data.filename.replace(/\.[^/.]+$/, ""),
          artist: "You",
          durationLabel: "--:--",
        });
      } else {
        setError(result.error);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-love text-paper text-xs font-medium py-2.5 hover:bg-love-dark transition-colors disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <UploadCloud className="h-3.5 w-3.5" />
        )}
        {uploading ? "Uploading…" : "Upload your own track"}
      </button>
      {error && <p className="text-[11px] text-love dark:text-blush">{error}</p>}

      <div className="space-y-1.5">
        {state.songs.map((song) => {
          const active = state.selectedSongId === song.id;
          return (
            <button
              key={song.id}
              onClick={() => selectSong(song.id)}
              className={cn(
                "w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                active
                  ? "bg-love/10 dark:bg-blush/10"
                  : "hover:bg-ink/5 dark:hover:bg-paper/5"
              )}
            >
              <span
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                  active ? "bg-love text-paper" : "bg-ink/10 dark:bg-paper/10 text-ink/50 dark:text-paper/50"
                )}
              >
                <Music2 className="h-3.5 w-3.5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-medium text-ink dark:text-paper truncate">
                  {song.title}
                </span>
                <span className="block text-[11px] text-ink/45 dark:text-paper/45 truncate">
                  {song.artist}
                </span>
              </span>
              <span className="text-[11px] text-ink/40 dark:text-paper/40 tabular-nums">
                {song.durationLabel}
              </span>
            </button>
          );
        })}
      </div>

      <Slider label="Volume" value={state.volume} onChange={setVolume} />

      <div className="flex items-center justify-between">
        <span className="text-xs text-ink/70 dark:text-paper/70">Auto play</span>
        <Switch checked={state.autoPlay} onCheckedChange={toggleAutoPlay} label="Auto play" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink/70 dark:text-paper/70">Loop</span>
        <Switch checked={state.loop} onCheckedChange={toggleLoop} label="Loop" />
      </div>
    </div>
  );
}
