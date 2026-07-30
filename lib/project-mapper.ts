import type { EditableStudioState } from "@/types/studio";
import { decodeProjectTheme } from "@/lib/project-theme";
import type { ProjectWithMedia } from "@/repositories/project.repository";
import {
  generateDummySongs,
  generateDummyTimeline,
  defaultMessages,
} from "@/utils/studio-dummy-data";

/**
 * Converts a Prisma Project (+ media) record into the Studio's editable
 * state shape.
 *
 * Important: this schema's Project model (per the database-layer spec)
 * only persists title/status/theme/font/colors/coverImage/media — it has no
 * columns for the Studio's timeline, sticker, per-element property, or
 * music-selection state. Those fields are re-seeded from the same dummy
 * defaults used for a brand-new project on every load, so they work fully
 * within a session but don't round-trip across saves yet. Persisting them
 * would need additional models (TimelineEvent, Sticker, ElementProperty,
 * MusicTrack) — intentionally out of scope for this schema, which is
 * fixed to exactly the five models the spec called for.
 */
export function projectToEditableState(project: ProjectWithMedia): EditableStudioState {
  const photos = project.media
    .filter((m) => m.type === "IMAGE")
    .map((m) => ({ id: m.id, url: m.url, alt: m.filename }));

  const videos = project.media
    .filter((m) => m.type === "VIDEO")
    .map((m) => ({ id: m.id, url: m.url, thumbnailSeed: m.id, title: m.filename }));

  const songs = generateDummySongs();

  return {
    photos,
    videos,
    songs,
    selectedSongId: songs[0]?.id ?? null,
    volume: 70,
    autoPlay: true,
    loop: true,
    timeline: generateDummyTimeline(),
    messages: {
      ...defaultMessages(),
      title: project.title,
    },
    theme: decodeProjectTheme(project.theme),
    stickers: [],
    properties: {},
  };
}
