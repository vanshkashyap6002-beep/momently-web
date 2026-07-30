"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  StudioState,
  EditableStudioState,
  StudioPhoto,
  StudioVideo,
  StudioTheme,
  StudioMessages,
  TimelineEvent,
  StickerKind,
  PlacedSticker,
  ElementProperties,
  SelectableItemType,
  DeviceMode,
} from "@/types/studio";
import { defaultElementProperties } from "@/types/studio";
import {
  generateDummyPhotos,
  generateDummyVideos,
  generateDummySongs,
  generateDummyTimeline,
  defaultMessages,
  defaultTheme,
} from "@/utils/studio-dummy-data";

const HISTORY_LIMIT = 40;

function makeInitialEditableState(): EditableStudioState {
  return {
    photos: generateDummyPhotos(),
    videos: generateDummyVideos(),
    songs: generateDummySongs(),
    selectedSongId: "song-1",
    volume: 70,
    autoPlay: true,
    loop: true,
    timeline: generateDummyTimeline(),
    messages: defaultMessages(),
    theme: defaultTheme(),
    stickers: [],
    properties: {},
  };
}

function extractEditable(state: StudioState): EditableStudioState {
  const { photos, videos, songs, selectedSongId, volume, autoPlay, loop, timeline, messages, theme, stickers, properties } =
    state;
  return { photos, videos, songs, selectedSongId, volume, autoPlay, loop, timeline, messages, theme, stickers, properties };
}

type Action =
  | { type: "ADD_PHOTOS"; photos: StudioPhoto[] }
  | { type: "REMOVE_PHOTO"; id: string }
  | { type: "REPLACE_PHOTO"; id: string; url: string }
  | { type: "ADD_VIDEOS"; videos: StudioVideo[] }
  | { type: "REMOVE_VIDEO"; id: string }
  | { type: "SELECT_SONG"; id: string }
  | { type: "ADD_SONG"; song: EditableStudioState["songs"][number] }
  | { type: "SET_VOLUME"; value: number }
  | { type: "TOGGLE_AUTOPLAY" }
  | { type: "TOGGLE_LOOP" }
  | { type: "ADD_TIMELINE_EVENT" }
  | { type: "REMOVE_TIMELINE_EVENT"; id: string }
  | { type: "UPDATE_TIMELINE_EVENT"; id: string; patch: Partial<TimelineEvent> }
  | { type: "REORDER_TIMELINE"; fromIndex: number; toIndex: number }
  | { type: "UPDATE_MESSAGES"; patch: Partial<StudioMessages> }
  | { type: "UPDATE_THEME"; patch: Partial<StudioTheme> }
  | { type: "ADD_STICKER"; kind: StickerKind }
  | { type: "REMOVE_STICKER"; id: string }
  | { type: "MOVE_STICKER"; id: string; x: number; y: number }
  | { type: "SELECT_ITEM"; id: string | null; itemType: SelectableItemType }
  | { type: "UPDATE_PROPERTIES"; id: string; patch: Partial<ElementProperties> }
  | { type: "SET_DEVICE"; device: DeviceMode }
  | { type: "SET_ZOOM"; zoom: number }
  | { type: "DUPLICATE_SELECTED" }
  | { type: "DELETE_SELECTED" }
  | { type: "SET_PUBLISH_STATUS"; status: "draft" | "published" }
  | { type: "UNDO" }
  | { type: "REDO" };

const MUTATING_TYPES = new Set<Action["type"]>([
  "ADD_PHOTOS",
  "REMOVE_PHOTO",
  "REPLACE_PHOTO",
  "ADD_VIDEOS",
  "REMOVE_VIDEO",
  "SELECT_SONG",
  "ADD_SONG",
  "SET_VOLUME",
  "TOGGLE_AUTOPLAY",
  "TOGGLE_LOOP",
  "ADD_TIMELINE_EVENT",
  "REMOVE_TIMELINE_EVENT",
  "UPDATE_TIMELINE_EVENT",
  "REORDER_TIMELINE",
  "UPDATE_MESSAGES",
  "UPDATE_THEME",
  "ADD_STICKER",
  "REMOVE_STICKER",
  "MOVE_STICKER",
  "UPDATE_PROPERTIES",
  "DUPLICATE_SELECTED",
  "DELETE_SELECTED",
]);

function reducer(state: StudioState, action: Action): StudioState {
  if (action.type === "UNDO") {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, -1);
    return {
      ...state,
      ...previous,
      past: newPast,
      future: [extractEditable(state), ...state.future].slice(0, HISTORY_LIMIT),
    };
  }

  if (action.type === "REDO") {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    const newFuture = state.future.slice(1);
    return {
      ...state,
      ...next,
      past: [...state.past, extractEditable(state)].slice(-HISTORY_LIMIT),
      future: newFuture,
    };
  }

  // Non-history-tracked, ephemeral UI state
  switch (action.type) {
    case "SELECT_ITEM":
      return { ...state, selectedItemId: action.id, selectedItemType: action.itemType };
    case "SET_DEVICE":
      return { ...state, device: action.device };
    case "SET_ZOOM":
      return { ...state, zoom: action.zoom };
    case "SET_PUBLISH_STATUS":
      return { ...state, publishStatus: action.status };
    default:
      break;
  }

  const past = MUTATING_TYPES.has(action.type)
    ? [...state.past, extractEditable(state)].slice(-HISTORY_LIMIT)
    : state.past;
  const future = MUTATING_TYPES.has(action.type) ? [] : state.future;

  let next: StudioState = { ...state, past, future };

  switch (action.type) {
    case "ADD_PHOTOS":
      next = { ...next, photos: [...next.photos, ...action.photos] };
      break;
    case "REMOVE_PHOTO":
      next = { ...next, photos: next.photos.filter((p) => p.id !== action.id) };
      break;
    case "REPLACE_PHOTO":
      next = {
        ...next,
        photos: next.photos.map((p) => (p.id === action.id ? { ...p, url: action.url } : p)),
      };
      break;
    case "REMOVE_VIDEO":
      next = { ...next, videos: next.videos.filter((v) => v.id !== action.id) };
      break;
    case "ADD_VIDEOS":
      next = { ...next, videos: [...next.videos, ...action.videos] };
      break;
    case "SELECT_SONG":
      next = { ...next, selectedSongId: action.id };
      break;
    case "ADD_SONG":
      next = { ...next, songs: [...next.songs, action.song], selectedSongId: action.song.id };
      break;
    case "SET_VOLUME":
      next = { ...next, volume: action.value };
      break;
    case "TOGGLE_AUTOPLAY":
      next = { ...next, autoPlay: !next.autoPlay };
      break;
    case "TOGGLE_LOOP":
      next = { ...next, loop: !next.loop };
      break;
    case "ADD_TIMELINE_EVENT": {
      const id = `evt-${Date.now()}`;
      next = {
        ...next,
        timeline: [
          ...next.timeline,
          { id, date: "New date", title: "New memory", description: "Describe this moment." },
        ],
      };
      break;
    }
    case "REMOVE_TIMELINE_EVENT":
      next = { ...next, timeline: next.timeline.filter((e) => e.id !== action.id) };
      break;
    case "UPDATE_TIMELINE_EVENT":
      next = {
        ...next,
        timeline: next.timeline.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)),
      };
      break;
    case "REORDER_TIMELINE": {
      const list = [...next.timeline];
      const [moved] = list.splice(action.fromIndex, 1);
      list.splice(action.toIndex, 0, moved);
      next = { ...next, timeline: list };
      break;
    }
    case "UPDATE_MESSAGES":
      next = { ...next, messages: { ...next.messages, ...action.patch } };
      break;
    case "UPDATE_THEME":
      next = { ...next, theme: { ...next.theme, ...action.patch } };
      break;
    case "ADD_STICKER": {
      const id = `sticker-${Date.now()}`;
      const sticker: PlacedSticker = { id, kind: action.kind, x: 50, y: 50 };
      next = { ...next, stickers: [...next.stickers, sticker] };
      break;
    }
    case "REMOVE_STICKER":
      next = { ...next, stickers: next.stickers.filter((s) => s.id !== action.id) };
      break;
    case "MOVE_STICKER":
      next = {
        ...next,
        stickers: next.stickers.map((s) =>
          s.id === action.id ? { ...s, x: action.x, y: action.y } : s
        ),
      };
      break;
    case "UPDATE_PROPERTIES": {
      const current = next.properties[action.id] ?? defaultElementProperties;
      next = {
        ...next,
        properties: { ...next.properties, [action.id]: { ...current, ...action.patch } },
      };
      break;
    }
    case "DUPLICATE_SELECTED": {
      if (state.selectedItemType === "photo" && state.selectedItemId) {
        const source = next.photos.find((p) => p.id === state.selectedItemId);
        if (source) {
          const id = `photo-${Date.now()}`;
          next = { ...next, photos: [...next.photos, { ...source, id }] };
        }
      } else if (state.selectedItemType === "sticker" && state.selectedItemId) {
        const source = next.stickers.find((s) => s.id === state.selectedItemId);
        if (source) {
          const id = `sticker-${Date.now()}`;
          next = {
            ...next,
            stickers: [...next.stickers, { ...source, id, x: source.x + 6, y: source.y + 6 }],
          };
        }
      } else if (state.selectedItemType === "timeline" && state.selectedItemId) {
        const source = next.timeline.find((e) => e.id === state.selectedItemId);
        if (source) {
          const id = `evt-${Date.now()}`;
          next = { ...next, timeline: [...next.timeline, { ...source, id }] };
        }
      }
      break;
    }
    case "DELETE_SELECTED": {
      if (state.selectedItemType === "photo" && state.selectedItemId) {
        next = { ...next, photos: next.photos.filter((p) => p.id !== state.selectedItemId) };
      } else if (state.selectedItemType === "sticker" && state.selectedItemId) {
        next = { ...next, stickers: next.stickers.filter((s) => s.id !== state.selectedItemId) };
      } else if (state.selectedItemType === "timeline" && state.selectedItemId) {
        next = { ...next, timeline: next.timeline.filter((e) => e.id !== state.selectedItemId) };
      }
      break;
    }
    default:
      break;
  }

  return next;
}

interface StudioContextValue {
  state: StudioState;
  canUndo: boolean;
  canRedo: boolean;
  addPhotos: (photos: StudioPhoto[]) => void;
  removePhoto: (id: string) => void;
  replacePhoto: (id: string, url: string) => void;
  removeVideo: (id: string) => void;
  addVideos: (videos: StudioVideo[]) => void;
  selectSong: (id: string) => void;
  addSong: (song: EditableStudioState["songs"][number]) => void;
  setVolume: (value: number) => void;
  toggleAutoPlay: () => void;
  toggleLoop: () => void;
  addTimelineEvent: () => void;
  removeTimelineEvent: (id: string) => void;
  updateTimelineEvent: (id: string, patch: Partial<TimelineEvent>) => void;
  reorderTimeline: (fromIndex: number, toIndex: number) => void;
  updateMessages: (patch: Partial<StudioMessages>) => void;
  updateTheme: (patch: Partial<StudioTheme>) => void;
  addSticker: (kind: StickerKind) => void;
  removeSticker: (id: string) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  selectItem: (id: string | null, itemType: SelectableItemType) => void;
  updateProperties: (id: string, patch: Partial<ElementProperties>) => void;
  getProperties: (id: string) => ElementProperties;
  setDevice: (device: DeviceMode) => void;
  setZoom: (zoom: number) => void;
  duplicateSelected: () => void;
  deleteSelected: () => void;
  setPublishStatus: (status: "draft" | "published") => void;
  undo: () => void;
  redo: () => void;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({
  templateId,
  templateName,
  projectId,
  initialState,
  children,
}: {
  templateId: string;
  templateName: string;
  projectId: string;
  initialState?: EditableStudioState;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    ...(initialState ?? makeInitialEditableState()),
    templateId,
    templateName,
    projectId,
    selectedItemId: null,
    selectedItemType: null,
    device: "desktop" as const,
    zoom: 100,
    publishStatus: "draft" as const,
    past: [],
    future: [],
  }));

  const getProperties = useCallback(
    (id: string) => state.properties[id] ?? defaultElementProperties,
    [state.properties]
  );

  const value = useMemo<StudioContextValue>(
    () => ({
      state,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      addPhotos: (photos) => dispatch({ type: "ADD_PHOTOS", photos }),
      removePhoto: (id) => dispatch({ type: "REMOVE_PHOTO", id }),
      replacePhoto: (id, url) => dispatch({ type: "REPLACE_PHOTO", id, url }),
      removeVideo: (id) => dispatch({ type: "REMOVE_VIDEO", id }),
      addVideos: (videos) => dispatch({ type: "ADD_VIDEOS", videos }),
      selectSong: (id) => dispatch({ type: "SELECT_SONG", id }),
      addSong: (song) => dispatch({ type: "ADD_SONG", song }),
      setVolume: (value) => dispatch({ type: "SET_VOLUME", value }),
      toggleAutoPlay: () => dispatch({ type: "TOGGLE_AUTOPLAY" }),
      toggleLoop: () => dispatch({ type: "TOGGLE_LOOP" }),
      addTimelineEvent: () => dispatch({ type: "ADD_TIMELINE_EVENT" }),
      removeTimelineEvent: (id) => dispatch({ type: "REMOVE_TIMELINE_EVENT", id }),
      updateTimelineEvent: (id, patch) => dispatch({ type: "UPDATE_TIMELINE_EVENT", id, patch }),
      reorderTimeline: (fromIndex, toIndex) =>
        dispatch({ type: "REORDER_TIMELINE", fromIndex, toIndex }),
      updateMessages: (patch) => dispatch({ type: "UPDATE_MESSAGES", patch }),
      updateTheme: (patch) => dispatch({ type: "UPDATE_THEME", patch }),
      addSticker: (kind) => dispatch({ type: "ADD_STICKER", kind }),
      removeSticker: (id) => dispatch({ type: "REMOVE_STICKER", id }),
      moveSticker: (id, x, y) => dispatch({ type: "MOVE_STICKER", id, x, y }),
      selectItem: (id, itemType) => dispatch({ type: "SELECT_ITEM", id, itemType }),
      updateProperties: (id, patch) => dispatch({ type: "UPDATE_PROPERTIES", id, patch }),
      getProperties,
      setDevice: (device) => dispatch({ type: "SET_DEVICE", device }),
      setZoom: (zoom) => dispatch({ type: "SET_ZOOM", zoom }),
      duplicateSelected: () => dispatch({ type: "DUPLICATE_SELECTED" }),
      deleteSelected: () => dispatch({ type: "DELETE_SELECTED" }),
      setPublishStatus: (status) => dispatch({ type: "SET_PUBLISH_STATUS", status }),
      undo: () => dispatch({ type: "UNDO" }),
      redo: () => dispatch({ type: "REDO" }),
    }),
    [state, getProperties]
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useMemoryStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useMemoryStudio must be used within a StudioProvider");
  return ctx;
}
