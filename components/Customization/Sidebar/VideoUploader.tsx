"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { UploadCloud, Play, Trash2, Loader2 } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { uploadVideo, deleteMedia } from "@/app/actions/media.actions";
import { withRetry, isLocalId, nextLocalId } from "@/lib/upload-client";

export function VideoUploader() {
  const { state, addVideos, removeVideo } = useMemoryStudio();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newVideos = Array.from(files)
      .filter((f) => f.type.startsWith("video/"))
      .map((file) => ({
        id: nextLocalId("video"),
        url: "",
        thumbnailSeed: `pending-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        file,
      }));

    if (newVideos.length === 0) return;

    addVideos(newVideos.map(({ file, ...v }) => v));
    setUploadingIds((prev) => new Set([...prev, ...newVideos.map((v) => v.id)]));

    for (const video of newVideos) {
      const { file } = video;
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", state.projectId);

        const result = await withRetry(() => uploadVideo(formData));

        removeVideo(video.id);
        if (result.ok) {
          addVideos([
            {
              id: result.data.id,
              url: result.data.url,
              thumbnailSeed: result.data.id,
              title: result.data.filename,
            },
          ]);
        }
        // On failure the placeholder is simply dropped — there's nothing
        // useful to preview for a video that never reached storage.
      } finally {
        setUploadingIds((prev) => {
          const next = new Set(prev);
          next.delete(video.id);
          return next;
        });
      }
    }
  }

  async function handleRemove(id: string) {
    removeVideo(id);
    if (!isLocalId(id)) {
      await deleteMedia(id);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-lg bg-love text-paper text-xs font-medium py-2.5 hover:bg-love-dark transition-colors mb-3"
      >
        Upload videos
      </button>

      <div className="space-y-2">
        {state.videos.map((video) => (
          <motion.div
            key={video.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex items-center gap-3 rounded-lg border border-ink/10 dark:border-paper/10 p-2"
          >
            <div className="relative h-12 w-16 rounded-md overflow-hidden shrink-0 bg-ink/10">
              <Image
                src={`https://picsum.photos/seed/${video.thumbnailSeed || video.id}/200/140`}
                alt={video.title}
                fill
                unoptimized
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/30">
                {uploadingIds.has(video.id) ? (
                  <Loader2 className="h-4 w-4 text-paper animate-spin" />
                ) : (
                  <Play className="h-4 w-4 text-paper" fill="currentColor" />
                )}
              </div>
            </div>
            <span className="flex-1 text-xs text-ink/75 dark:text-paper/75 truncate">
              {video.title}
            </span>
            <button
              onClick={() => handleRemove(video.id)}
              aria-label={`Delete ${video.title}`}
              className="h-6 w-6 rounded-full flex items-center justify-center text-ink/40 hover:text-love hover:bg-love/10 dark:text-paper/40 dark:hover:text-blush transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}

        {state.videos.length === 0 && (
          <p className="text-xs text-ink/40 dark:text-paper/40 flex items-center gap-2 py-4 justify-center">
            <UploadCloud className="h-4 w-4" /> No videos yet
          </p>
        )}
      </div>
    </div>
  );
}
