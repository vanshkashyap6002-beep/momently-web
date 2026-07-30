import type { ColorScheme, FontPairing, ButtonStyle, BackgroundStyle } from "@/types/studio";

export const colorSchemeMap: Record<ColorScheme, { primary: string; secondary: string; onPrimary: string }> = {
  "deep-love": { primary: "#7A1E2B", secondary: "#F1D6D9", onPrimary: "#FDFBF9" },
  "midnight-gold": { primary: "#B8964F", secondary: "#2A2417", onPrimary: "#12100F" },
  "blush-cream": { primary: "#C97B92", secondary: "#FBF3EE", onPrimary: "#FFFFFF" },
  "emerald-noir": { primary: "#2F4F4F", secondary: "#E7EFEC", onPrimary: "#FFFFFF" },
};

export const fontPairingMap: Record<FontPairing, { display: string; body: string }> = {
  "playfair-inter": {
    display: "'Playfair Display', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
  },
  "cormorant-work": {
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'Work Sans', system-ui, sans-serif",
  },
  "fraunces-manrope": {
    display: "'Fraunces', Georgia, serif",
    body: "'Manrope', system-ui, sans-serif",
  },
};

export const buttonStyleClass: Record<ButtonStyle, string> = {
  solid: "rounded-full shadow-md",
  outline: "rounded-full border-2 bg-transparent",
  "pill-glow": "rounded-full shadow-[0_0_24px_-4px_var(--preview-primary)]",
};

export const backgroundStyleClass: Record<BackgroundStyle, string> = {
  paper: "bg-[var(--preview-bg-paper)]",
  gradient: "bg-gradient-to-b from-[var(--preview-secondary)] to-[var(--preview-bg-paper)]",
  "photo-blur": "bg-[var(--preview-secondary)]",
};
