export type TemplateAccent = "birthday" | "anniversary" | "proposal" | "wedding";

export interface MemoryTemplate {
  id: string;
  name: string;
  accent: TemplateAccent;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  occasion: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type Occasion =
  | "Birthday"
  | "Anniversary"
  | "Proposal"
  | "Wedding"
  | "Valentine"
  | "Graduation"
  | "Baby Announcement"
  | "Farewell";

export type Theme = "Romantic" | "Playful" | "Elegant" | "Nostalgic" | "Bold" | "Minimal";

export type Style = "Cinematic" | "Polaroid" | "Storybook" | "Editorial" | "Handwritten";

export type Mood = "Warm" | "Dreamy" | "Joyful" | "Sentimental" | "Dramatic";

export interface MarketplaceTemplate {
  id: string;
  slug: string;
  name: string;
  occasion: Occasion;
  theme: Theme;
  style: Style;
  mood: Mood;
  price: number; // 0 = free
  likes: number;
  views: number;
  creator: {
    name: string;
    avatarSeed: string;
  };
  previewImageSeed: string;
  accent: TemplateAccent;
}
