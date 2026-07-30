import type {
  StudioPhoto,
  StudioVideo,
  StudioSong,
  TimelineEvent,
  StudioMessages,
  StudioTheme,
} from "@/types/studio";

export function generateDummyPhotos(): StudioPhoto[] {
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `photo-${i}`,
    url: `https://picsum.photos/seed/momently-memory-${i}/800/800`,
    alt: `Memory photo ${i + 1}`,
  }));
}

export function generateDummyVideos(): StudioVideo[] {
  const titles = ["First Dance", "Beach Day", "Surprise Party"];
  return titles.map((title, i) => ({
    id: `video-${i}`,
    url: "",
    thumbnailSeed: `momently-video-${i}`,
    title,
  }));
}

export function generateDummySongs(): StudioSong[] {
  return [
    { id: "song-1", title: "Golden Hour", artist: "Wren & Mica", durationLabel: "3:12" },
    { id: "song-2", title: "Slow Dance", artist: "The Paper Room", durationLabel: "2:54" },
    { id: "song-3", title: "Late Night Static", artist: "Aiko Field", durationLabel: "3:41" },
    { id: "song-4", title: "Warm Hands", artist: "Lior Sun", durationLabel: "2:38" },
    { id: "song-5", title: "Every Year", artist: "Nadia Cole", durationLabel: "4:02" },
  ];
}

export function generateDummyTimeline(): TimelineEvent[] {
  return [
    {
      id: "evt-1",
      date: "March 2019",
      title: "The First Hello",
      description: "A rainy afternoon, a shared umbrella, and a coffee that went cold.",
    },
    {
      id: "evt-2",
      date: "August 2020",
      title: "Moved Cities",
      description: "New apartment, same two people figuring it out together.",
    },
    {
      id: "evt-3",
      date: "June 2022",
      title: "The Trip to Goa",
      description: "Sunburnt, a little lost, entirely happy.",
    },
    {
      id: "evt-4",
      date: "December 2024",
      title: "The Question",
      description: "On a rooftop, under string lights, she said yes.",
    },
  ];
}

export function defaultMessages(): StudioMessages {
  return {
    title: "To Us, Every Year Since",
    subtitle: "Five years, four cities, one very patient cat.",
    aiPlaceholder:
      "Let AI write something — describe the moment and we'll draft a message in your voice.",
    customText:
      "However this page finds you, thank you for being part of the story. Here's to the next chapter.",
  };
}

export function defaultTheme(): StudioTheme {
  return {
    colorScheme: "deep-love",
    font: "playfair-inter",
    buttonStyle: "solid",
    animationStyle: "cinematic",
    background: "paper",
  };
}
