import Image from "next/image";
import Link from "next/link";
import { Music2, Heart } from "lucide-react";
import type { CSSProperties } from "react";
import { colorSchemeMap, fontPairingMap, buttonStyleClass, backgroundStyleClass } from "@/utils/theme-map";
import { stickerIconMap } from "@/components/Customization/Sidebar/StickerPanel";
import type { EditableStudioState } from "@/types/studio";
import { cn } from "@/lib/utils";

/**
 * Public, read-only render of a published memory page.
 *
 * This mirrors the visual design of the Studio's own live preview
 * (components/Customization/Canvas/MemoryPreview.tsx) — same sections, same
 * theme/color/font handling, same Tailwind classes — so a published page
 * looks exactly like what its creator saw while editing it. It does NOT
 * import or modify that component: this is a separate component because
 * the Studio's preview is wired to useMemoryStudio() for click-to-select
 * and drag-to-move editing, which has no place on a public page a stranger
 * opens from a shared link. The only other difference is that this renders
 * at full page width instead of inside the Studio's scaled device-preview
 * frame, since there's no editor chrome around it here.
 */
export function PublicMemoryView({ state }: { state: EditableStudioState }) {
  const { theme, photos, timeline, messages, songs, selectedSongId, stickers } = state;

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
    <div style={cssVars} className={cn("min-h-screen", backgroundStyleClass[theme.background])}>
      {/* Sticker layer — positions are only ever produced by the Studio;
          today's schema doesn't persist them yet, so this is typically
          empty, but renders correctly if that changes. */}
      <div className="pointer-events-none relative z-30">
        {stickers.map((sticker) => {
          const Icon = stickerIconMap[sticker.kind];
          return (
            <div
              key={sticker.id}
              style={{ left: `${sticker.x}%`, top: `${sticker.y}%` }}
              className="absolute h-9 w-9 flex items-center justify-center rounded-full bg-paper/90 dark:bg-ink/80 shadow-md -translate-x-1/2 -translate-y-1/2"
            >
              <Icon className="h-4 w-4" style={{ color: colors.primary }} />
            </div>
          );
        })}
      </div>

      {/* Hero */}
      <section className="relative h-[420px] md:h-[560px] w-full overflow-hidden">
        {heroPhoto && (
          <div className="absolute inset-0">
            <Image
              src={heroPhoto.url}
              alt={heroPhoto.alt}
              fill
              unoptimized
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-14">
          <h1
            style={{ fontFamily: fonts.display }}
            className="text-4xl md:text-6xl text-paper max-w-2xl"
          >
            {messages.title}
          </h1>
          <p
            style={{ fontFamily: fonts.body }}
            className="mt-4 text-base md:text-lg text-paper/85 max-w-xl"
          >
            {messages.subtitle}
          </p>
        </div>
      </section>

      {/* Music bar */}
      {currentSong && (
        <div
          className="flex items-center gap-3 px-6 md:px-10 py-3 border-b border-ink/5"
          style={{ fontFamily: fonts.body }}
        >
          <Music2 className="h-3.5 w-3.5 text-ink/40" />
          <span className="text-xs text-ink/60">
            {currentSong.title} &middot; {currentSong.artist}
          </span>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="px-6 md:px-16 py-16 max-w-3xl mx-auto" style={{ fontFamily: fonts.body }}>
          <p
            className="text-xs uppercase tracking-[0.2em] font-medium mb-8"
            style={{ color: colors.primary, fontFamily: fonts.body }}
          >
            Our Story
          </p>
          <div className="space-y-6">
            {timeline.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-ink/10 dark:border-paper/10 bg-paper/60 dark:bg-ink-soft/50 p-5"
              >
                <p className="text-xs font-medium" style={{ color: colors.primary }}>
                  {event.date}
                </p>
                <h3 className="mt-1 text-xl" style={{ fontFamily: fonts.display }}>
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">{event.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery — masonry */}
      {galleryPhotos.length > 0 && (
        <section className="px-6 md:px-16 pb-16 max-w-5xl mx-auto">
          <p
            className="text-xs uppercase tracking-[0.2em] font-medium mb-8"
            style={{ color: colors.primary, fontFamily: fonts.body }}
          >
            Gallery
          </p>
          <div className="columns-2 md:columns-3 gap-3 [column-fill:_balance]">
            {galleryPhotos.map((photo, i) => (
              <div key={photo.id} className="mb-3 break-inside-avoid overflow-hidden rounded-lg">
                <div className="relative w-full" style={{ aspectRatio: i % 3 === 0 ? "3/4" : "1/1" }}>
                  <Image src={photo.url} alt={photo.alt} fill unoptimized className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ending message */}
      <section
        className="px-6 md:px-10 py-20 text-center"
        style={{ backgroundColor: colors.secondary, fontFamily: fonts.body }}
      >
        <Heart className="h-6 w-6 mx-auto mb-4" style={{ color: colors.primary }} />
        <p
          className="max-w-md mx-auto text-lg md:text-xl leading-relaxed"
          style={{ fontFamily: fonts.display, color: "#2a2320" }}
        >
          {messages.customText}
        </p>
        <div
          style={
            {
              backgroundColor: theme.buttonStyle === "outline" ? "transparent" : colors.primary,
              borderColor: colors.primary,
              color: theme.buttonStyle === "outline" ? colors.primary : colors.onPrimary,
            } as CSSProperties
          }
          className={cn("mt-8 inline-block px-7 py-3 text-sm font-medium", buttonStyleClass[theme.buttonStyle])}
        >
          Made with love, on Momently
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-6 flex items-center justify-between text-[11px] text-ink/40 dark:text-paper/40 border-t border-ink/5 dark:border-paper/10">
        <span style={{ fontFamily: fonts.display }}>Momently</span>
        <Link href="/" className="hover:underline">
          Made with Momently
        </Link>
      </footer>
    </div>
  );
}
