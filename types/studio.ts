export interface StudioPhoto {
  id: string;
  url: string;
  alt: string;
}

export interface StudioVideo {
  id: string;
  url: string;
  thumbnailSeed: string;
  title: string;
}

export interface StudioSong {
  id: string;
  title: string;
  artist: string;
  durationLabel: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
}

export type StickerKind =
  | "heart"
  | "cake"
  | "flower"
  | "ring"
  | "stars"
  | "confetti"
  | "cat"
  | "love";

export interface PlacedSticker {
  id: string;
  kind: StickerKind;
  x: number; // percentage position within canvas
  y: number;
}

export type ButtonStyle = "solid" | "outline" | "pill-glow";
export type AnimationStyle = "gentle" | "cinematic" | "playful";
export type BackgroundStyle = "paper" | "gradient" | "photo-blur";
export type FontPairing = "playfair-inter" | "cormorant-work" | "fraunces-manrope";
export type ColorScheme = "deep-love" | "midnight-gold" | "blush-cream" | "emerald-noir";

export interface StudioTheme {
  colorScheme: ColorScheme;
  font: FontPairing;
  buttonStyle: ButtonStyle;
  animationStyle: AnimationStyle;
  background: BackgroundStyle;
}

export interface StudioMessages {
  title: string;
  subtitle: string;
  aiPlaceholder: string;
  customText: string;
}

export type SelectableItemType = "photo" | "video" | "sticker" | "timeline" | "cta" | null;

export interface ElementProperties {
  opacity: number; // 0-100
  size: number; // 50-150 (%)
  padding: number; // 0-40 px
  borderRadius: number; // 0-32 px
  shadow: number; // 0-100
  animationSpeed: number; // 50-200 (%)
}

export const defaultElementProperties: ElementProperties = {
  opacity: 100,
  size: 100,
  padding: 12,
  borderRadius: 16,
  shadow: 40,
  animationSpeed: 100,
};

export type DeviceMode = "desktop" | "tablet" | "mobile";
export type PublishStatus = "draft" | "published";

export interface EditableStudioState {
  photos: StudioPhoto[];
  videos: StudioVideo[];
  songs: StudioSong[];
  selectedSongId: string | null;
  volume: number;
  autoPlay: boolean;
  loop: boolean;
  timeline: TimelineEvent[];
  messages: StudioMessages;
  theme: StudioTheme;
  stickers: PlacedSticker[];
  properties: Record<string, ElementProperties>;
}

export interface StudioState extends EditableStudioState {
  templateId: string;
  templateName: string;
  /** The Studio guarantees a DRAFT Project row exists before it renders
   * (see `projectService.getOrCreateStudioProject`), so this is always a
   * real database id — media uploads, save/publish, etc. all key off it. */
  projectId: string;
  selectedItemId: string | null;
  selectedItemType: SelectableItemType;
  device: DeviceMode;
  zoom: number;
  publishStatus: PublishStatus;
  past: EditableStudioState[];
  future: EditableStudioState[];
}
