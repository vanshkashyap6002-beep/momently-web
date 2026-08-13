import type { Template, User } from "@prisma/client";
import type {
  MarketplaceTemplate,
  Occasion,
  Theme,
  Style,
  Mood,
  TemplateAccent,
} from "@/types";

const occasions: Occasion[] = [
  "Birthday",
  "Anniversary",
  "Proposal",
  "Wedding",
  "Valentine",
  "Graduation",
  "Baby Announcement",
  "Farewell",
];

const themes: Theme[] = ["Romantic", "Playful", "Elegant", "Nostalgic", "Bold", "Minimal"];
const styles: Style[] = ["Cinematic", "Polaroid", "Storybook", "Editorial", "Handwritten"];
const moods: Mood[] = ["Warm", "Dreamy", "Joyful", "Sentimental", "Dramatic"];

/** One fixed, hand-authored template per category — replaces the previous
 * 74-item randomly-generated placeholder dataset. */
export const marketplaceTemplates: MarketplaceTemplate[] = [
  {
    id: "tpl-birthday",
    slug: "golden-hour-letter",
    name: "Golden Hour Letter",
    occasion: "Birthday",
    theme: "Playful",
    style: "Polaroid",
    mood: "Joyful",
    price: 0,
    likes: 1240,
    views: 18300,
    creator: { name: "Studio Noor", avatarSeed: "studio-noor" },
    previewImageSeed: "golden-hour-letter",
    accent: "birthday",
  },
  {
    id: "tpl-anniversary",
    slug: "paper-lantern-album",
    name: "Paper Lantern Album",
    occasion: "Anniversary",
    theme: "Romantic",
    style: "Cinematic",
    mood: "Warm",
    price: 499,
    likes: 2860,
    views: 24100,
    creator: { name: "Mira Desai", avatarSeed: "mira-desai" },
    previewImageSeed: "paper-lantern-album",
    accent: "anniversary",
  },
  {
    id: "tpl-proposal",
    slug: "quiet-bloom-reel",
    name: "Quiet Bloom Reel",
    occasion: "Proposal",
    theme: "Romantic",
    style: "Cinematic",
    mood: "Dreamy",
    price: 799,
    likes: 3420,
    views: 31900,
    creator: { name: "Arjun Kapoor", avatarSeed: "arjun-kapoor" },
    previewImageSeed: "quiet-bloom-reel",
    accent: "proposal",
  },
  {
    id: "tpl-wedding",
    slug: "late-night-note",
    name: "Late Night Note",
    occasion: "Wedding",
    theme: "Elegant",
    style: "Editorial",
    mood: "Sentimental",
    price: 1299,
    likes: 4110,
    views: 38200,
    creator: { name: "Little Ink Co.", avatarSeed: "little-ink-co" },
    previewImageSeed: "late-night-note",
    accent: "wedding",
  },
  {
    id: "tpl-valentine",
    slug: "first-light-scrapbook",
    name: "First Light Scrapbook",
    occasion: "Valentine",
    theme: "Nostalgic",
    style: "Storybook",
    mood: "Sentimental",
    price: 0,
    likes: 1970,
    views: 21400,
    creator: { name: "Sana Studio", avatarSeed: "sana-studio" },
    previewImageSeed: "first-light-scrapbook",
    accent: "anniversary",
  },
  {
    id: "tpl-graduation",
    slug: "velvet-hour-timeline",
    name: "Velvet Hour Timeline",
    occasion: "Graduation",
    theme: "Bold",
    style: "Editorial",
    mood: "Dramatic",
    price: 599,
    likes: 1420,
    views: 15600,
    creator: { name: "Rhea Malhotra", avatarSeed: "rhea-malhotra" },
    previewImageSeed: "velvet-hour-timeline",
    accent: "wedding",
  },
  {
    id: "tpl-baby-announcement",
    slug: "soft-landing-postcard",
    name: "Soft Landing Postcard",
    occasion: "Baby Announcement",
    theme: "Minimal",
    style: "Handwritten",
    mood: "Warm",
    price: 0,
    likes: 980,
    views: 9800,
    creator: { name: "Paper & Pixel", avatarSeed: "paper-and-pixel" },
    previewImageSeed: "soft-landing-postcard",
    accent: "birthday",
  },
  {
    id: "tpl-farewell",
    slug: "open-window-diary",
    name: "Open Window Diary",
    occasion: "Farewell",
    theme: "Nostalgic",
    style: "Handwritten",
    mood: "Sentimental",
    price: 399,
    likes: 760,
    views: 8100,
    creator: { name: "Devansh Rao", avatarSeed: "devansh-rao" },
    previewImageSeed: "open-window-diary",
    accent: "proposal",
  },
];

export const filterOptions = {
  occasion: occasions,
  theme: themes,
  style: styles,
  mood: moods,
  price: [
    { label: "Free", min: 0, max: 0 },
    { label: "Under ₹500", min: 0, max: 500 },
    { label: "₹500 – ₹1,500", min: 500, max: 1500 },
    { label: "₹1,500+", min: 1500, max: Infinity },
  ],
};

// ---- Real-database bridge — added to connect the Marketplace UI to actual
// approved Template rows (audit finding C2). Everything above this line is
// untouched original dummy data. ----

const KNOWN_OCCASIONS: readonly Occasion[] = occasions;

/** The 4 core occasions have a dedicated accent color; every other occasion
 * (including ones this component of the audit doesn't control, like a
 * community creator's freeform `category` string) is bucketed into the
 * closest one, mirroring how the existing dummy data already aliases e.g.
 * Valentine -> "anniversary" and Graduation -> "wedding" above. */
const ACCENT_BY_OCCASION: Record<Occasion, TemplateAccent> = {
  Birthday: "birthday",
  Anniversary: "anniversary",
  Proposal: "proposal",
  Wedding: "wedding",
  Valentine: "anniversary",
  Graduation: "wedding",
  "Baby Announcement": "birthday",
  Farewell: "proposal",
};

type TemplateForMarketplace = Template & {
  creator?: Pick<User, "fullName"> | null;
};

/**
 * Adapts a real, database-backed Template row (already filtered to
 * isEnabled + APPROVED by the caller — see template.repository.ts) into the
 * exact MarketplaceTemplate shape the existing Marketplace UI
 * (TemplateGrid/TemplateCard/filters) already renders, so none of that UI
 * needs to change to display real templates alongside the dummy ones.
 *
 * The real schema doesn't track theme/mood/likes/views, so those get a
 * fixed, honest default rather than a fabricated value.
 */
export function toMarketplaceTemplate(template: TemplateForMarketplace): MarketplaceTemplate {
  const occasion = (KNOWN_OCCASIONS as readonly string[]).includes(template.category)
    ? (template.category as Occasion)
    : "Birthday";

  return {
    id: template.id,
    slug: template.slug,
    name: template.title,
    occasion,
    theme: "Elegant",
    style: "Editorial",
    mood: "Warm",
    price: Number(template.price),
    likes: 0,
    views: 0,
    creator: {
      name: template.creator?.fullName ?? "Momently",
      avatarSeed: template.creatorId ?? template.slug,
    },
    previewImageSeed: template.slug,
    accent: ACCENT_BY_OCCASION[occasion],
  };
}
