"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Music2, Play, Pause, Heart } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { useMemoryStudio } from "@/hooks/use-memory-studio";
import { colorSchemeMap, fontPairingMap, buttonStyleClass, backgroundStyleClass } from "@/utils/theme-map";
import { stickerIconMap } from "@/components/Customization/Sidebar/StickerPanel";
import type { ElementProperties } from "@/types/studio";
import { cn } from "@/lib/utils";

const deviceWidths: Record<string, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

function propsToStyle(props: ElementProperties): CSSProperties {
  return {
    opacity: props.opacity / 100,
    transform: `scale(${props.size / 100})`,
    padding: props.padding,
    borderRadius: props.borderRadius,
    boxShadow: `0 ${props.shadow / 4}px ${props.shadow}px -10px rgba(0,0,0,${props.shadow / 200})`,
  };
}

function speedDuration(base: number, speed: number) {
  return base / Math.max(0.5, speed / 100);
}

export function MemoryPreview() {
  const { state, selectItem, moveSticker, getProperties } = useMemoryStudio();
  const { theme, photos, timeline, messages, songs, selectedSongId, stickers, device, zoom } = state;
  const [musicPlaying, setMusicPlaying] = useState(state.autoPlay);

  const colors = colorSchemeMap[theme.colorScheme];
  const fonts = fontPairingMap[theme.font];
  const currentSong = songs.find((s) => s.id === selectedSongId);
  const heroPhoto = photos[0];
  const galleryPhotos = photos.slice(1);

  const cssVars = {
    "--preview-primary": colors.primary,
    "--preview-secondary": colors.secondary,
    "--preview-bg-paper": "#FDFBF9",
  } as CSSProperties;

  return (
    <div
      className="mx-auto transition-[width] duration-300 ease-out"
      style={{ width: deviceWidths[device], maxWidth: "100%" }}
    >
      <div
        style={{ ...cssVars, transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-ink/10 dark:border-paper/10 shadow-2xl",
          backgroundStyleClass[theme.background]
        )}
      >
        {/* Sticker overlay layer */}
        <div className="pointer-events-none absolute inset-0 z-30">
          {stickers.map((sticker) => {
            const Icon = stickerIconMap[sticker.kind];
            const props = getProperties(sticker.id);
            return (
              <button
                key={sticker.id}
                draggable
                onDragEnd={(e) => {
                  const container = e.currentTarget.parentElement?.parentElement;
                  if (!container) return;
                  const rect = container.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  moveSticker(sticker.id, Math.min(96, Math.max(2, x)), Math.min(96, Math.max(2, y)));
                }}
                onClick={() => selectItem(sticker.id, "sticker")}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  opacity: props.opacity / 100,
                  transform: `translate(-50%, -50%) scale(${props.size / 100})`,
                }}
                className={cn(
                  "pointer-events-auto absolute h-9 w-9 flex items-center justify-center rounded-full bg-paper/90 dark:bg-ink/80 shadow-md cursor-grab active:cursor-grabbing ring-2 transition-shadow",
                  state.selectedItemId === sticker.id ? "ring-love dark:ring-blush" : "ring-transparent"
                )}
              >
                <Icon className="h-4 w-4" style={{ color: colors.primary }} />
              </button>
            );
          })}
        </div>

        {/* Hero */}
        <section className="relative h-[340px] md:h-[420px] w-full overflow-hidden">
          {heroPhoto && (
            <motion.div
              key={heroPhoto.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: speedDuration(1.1, theme.animationStyle === "playful" ? 130 : 100),
                type: "spring",
                stiffness: 60,
                damping: 16,
              }}
              className="absolute inset-0"
            >
              <Image
                src={heroPhoto.url}
                alt={heroPhoto.alt}
                fill
                unoptimized
                className="object-cover"
                onClick={() => selectItem(heroPhoto.id, "photo")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            </motion.div>
          )}

          <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-10">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ fontFamily: fonts.display }}
              className="text-3xl md:text-4xl text-paper max-w-md"
            >
              {messages.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ fontFamily: fonts.body }}
              className="mt-3 text-sm md:text-base text-paper/85 max-w-sm"
            >
              {messages.subtitle}
            </motion.p>
          </div>
        </section>

        {/* Music bar */}
        {currentSong && (
          <div
            className="flex items-center gap-3 px-6 py-3 border-b border-ink/5"
            style={{ fontFamily: fonts.body }}
          >
            <button
              onClick={() => setMusicPlaying((p) => !p)}
              className="h-8 w-8 rounded-full flex items-center justify-center text-paper shrink-0"
              style={{ backgroundColor: colors.primary }}
              aria-label={musicPlaying ? "Pause music" : "Play music"}
            >
              {musicPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <Music2 className="h-3.5 w-3.5 text-ink/40" />
            <span className="text-xs text-ink/60">
              {currentSong.title} &middot; {currentSong.artist}
            </span>
          </div>
        )}

        {/* Timeline */}
        <section className="px-6 md:px-10 py-12" style={{ fontFamily: fonts.body }}>
          <p
            className="text-xs uppercase tracking-[0.2em] font-medium mb-6"
            style={{ color: colors.primary, fontFamily: fonts.body }}
          >
            Our Story
          </p>
          <div className="space-y-6">
            {timeline.map((event, i) => {
              const props = getProperties(event.id);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: speedDuration(0.5, 100), delay: i * 0.05 }}
                  onClick={() => selectItem(event.id, "timeline")}
                  style={propsToStyle(props)}
                  className={cn(
                    "cursor-pointer rounded-xl border bg-paper/60 dark:bg-ink-soft/50 p-4 ring-2 transition-shadow",
                    state.selectedItemId === event.id
                      ? "ring-love dark:ring-blush border-love/40"
                      : "ring-transparent border-ink/10 dark:border-paper/10"
                  )}
                >
                  <p className="text-xs font-medium" style={{ color: colors.primary }}>
                    {event.date}
                  </p>
                  <h3 className="mt-1 text-lg" style={{ fontFamily: fonts.display }}>
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">{event.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Gallery — masonry */}
        {galleryPhotos.length > 0 && (
          <section className="px-6 md:px-10 pb-12">
            <p
              className="text-xs uppercase tracking-[0.2em] font-medium mb-6"
              style={{ color: colors.primary, fontFamily: fonts.body }}
            >
              Gallery
            </p>
            <div className="columns-2 md:columns-3 gap-3 [column-fill:_balance]">
              {galleryPhotos.map((photo, i) => {
                const props = getProperties(photo.id);
                return (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: speedDuration(0.5, 100), delay: (i % 4) * 0.06 }}
                    onClick={() => selectItem(photo.id, "photo")}
                    style={propsToStyle(props)}
                    className={cn(
                      "mb-3 break-inside-avoid overflow-hidden ring-2 cursor-pointer",
                      state.selectedItemId === photo.id ? "ring-love dark:ring-blush" : "ring-transparent"
                    )}
                  >
                    <div className="relative w-full" style={{ aspectRatio: i % 3 === 0 ? "3/4" : "1/1" }}>
                      <Image src={photo.url} alt={photo.alt} fill unoptimized className="object-cover" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Ending message + CTA */}
        <section
          className="px-6 md:px-10 py-16 text-center"
          style={{ backgroundColor: colors.secondary, fontFamily: fonts.body }}
        >
          <Heart className="h-6 w-6 mx-auto mb-4" style={{ color: colors.primary }} />
          <p
            className="max-w-md mx-auto text-base md:text-lg leading-relaxed"
            style={{ fontFamily: fonts.display, color: "#2a2320" }}
          >
            {messages.customText}
          </p>
          <button
            onClick={() => selectItem("cta", "cta")}
            style={
              {
                backgroundColor: theme.buttonStyle === "outline" ? "transparent" : colors.primary,
                borderColor: colors.primary,
                color: theme.buttonStyle === "outline" ? colors.primary : colors.onPrimary,
              } as CSSProperties
            }
            className={cn(
              "mt-8 px-7 py-3 text-sm font-medium transition-transform hover:scale-105",
              buttonStyleClass[theme.buttonStyle]
            )}
          >
            Visit Our Memory
          </button>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-10 py-6 flex items-center justify-between text-[11px] text-ink/40 dark:text-paper/40 border-t border-ink/5 dark:border-paper/10">
          <span style={{ fontFamily: fonts.display }}>Momently</span>
          <span>Made with Momently</span>
        </footer>
      </div>
    </div>
  );
}
