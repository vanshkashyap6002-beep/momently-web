"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { UploadCloud, X, Repeat, Loader2 } from "lucide-react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { uploadImage, replaceMedia, deleteMedia } from "@/app/actions/media.actions";
import { withRetry, isLocalId, nextLocalId } from "@/lib/upload-client";

export function PhotoUploader() {
  const { state, addPhotos, removePhoto, replacePhoto, selectItem } = useMemoryStudio();
  const [isDragging, setIsDragging] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replaceTargetId = useRef<string | null>(null);

  function setPending(id: string, isPending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function uploadPhoto(localId: string, file: File) {
    setPending(localId, true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", state.projectId);

      // Transient network hiccups get a couple of automatic retries before
      // giving up — the UI has no dedicated "retry" button, so resilience
      // has to live here instead of behind a click the user would have to find.
      const result = await withRetry(() => uploadImage(formData));

      if (result.ok) {
        replacePhoto(localId, result.data.url);
        // Swap the id itself so Remove/Replace can address the real row.
        removePhoto(localId);
        addPhotos([{ id: result.data.id, url: result.data.url, alt: result.data.filename }]);
      }
      // On failure, the optimistic local blob preview stays in place as a
      // graceful degradation — the photo just never got persisted.
    } finally {
      setPending(localId, false);
    }
  }

  function filesToPhotos(files: FileList) {
    return Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: nextLocalId("photo"),
        url: URL.createObjectURL(file),
        alt: file.name,
        file,
      }));
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const optimistic = filesToPhotos(files);
    addPhotos(optimistic.map(({ file: _file, ...photo }) => photo));
    optimistic.forEach(({ id, file }) => uploadPhoto(id, file));
  }

  async function handleReplaceFiles(files: FileList | null) {
    if (!files || files.length === 0 || !replaceTargetId.current) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const id = replaceTargetId.current;
    replaceTargetId.current = null;

    const previousUrl = state.photos.find((p) => p.id === id)?.url;
    replacePhoto(id, URL.createObjectURL(file));
    setPending(id, true);

    try {
      if (isLocalId(id)) {
        // Never made it to the server the first time — treat this like a
        // fresh upload instead of a replace.
        await uploadPhoto(id, file);
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      const result = await withRetry(() => replaceMedia(id, formData));
      if (result.ok) {
        replacePhoto(id, result.data.url);
      } else if (previousUrl) {
        replacePhoto(id, previousUrl);
      }
    } finally {
      setPending(id, false);
    }
  }

  async function handleRemove(id: string) {
    removePhoto(id);
    if (!isLocalId(id)) {
      await deleteMedia(id);
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleReplaceFiles(e.target.files)}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full rounded-lg bg-love text-paper text-xs font-medium py-2.5 hover:bg-love-dark transition-colors mb-3"
      >
        Upload photos
      </button>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-xl border-2 border-dashed text-center py-6 px-3 text-xs transition-colors ${
          isDragging
            ? "border-love bg-blush/30 dark:bg-love/10 text-love dark:text-blush"
            : "border-ink/15 dark:border-paper/20 text-ink/45 dark:text-paper/45"
        }`}
      >
        <UploadCloud className="h-5 w-5 mx-auto mb-1.5" />
        Drag &amp; drop photos here
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {state.photos.map((photo) => (
          <motion.button
            key={photo.id}
            layout
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => selectItem(photo.id, "photo")}
            className={`group relative aspect-square rounded-lg overflow-hidden ring-2 transition-all ${
              state.selectedItemId === photo.id
                ? "ring-love dark:ring-blush"
                : "ring-transparent hover:ring-ink/15 dark:hover:ring-paper/20"
            }`}
          >
            <Image src={photo.url} alt={photo.alt} fill unoptimized className="object-cover" />
            {pendingIds.has(photo.id) && (
              <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-paper animate-spin" />
              </div>
            )}
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  replaceTargetId.current = photo.id;
                  replaceInputRef.current?.click();
                }}
                className="h-6 w-6 rounded-full bg-paper/90 flex items-center justify-center hover:bg-paper"
                aria-label="Replace photo"
              >
                <Repeat className="h-3 w-3 text-ink" />
              </span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(photo.id);
                }}
                className="h-6 w-6 rounded-full bg-paper/90 flex items-center justify-center hover:bg-paper"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3 text-ink" />
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
