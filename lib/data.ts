import type { MemoryTemplate, Testimonial, PricingPlan, FaqItem } from "@/types";

export const heroTemplates: MemoryTemplate[] = [
  {
    id: "birthday",
    name: "Birthday",
    accent: "birthday",
    description: "A page that unwraps like a gift, one memory at a time.",
  },
  {
    id: "anniversary",
    name: "Anniversary",
    accent: "anniversary",
    description: "Years, counted in moments instead of days.",
  },
  {
    id: "proposal",
    name: "Proposal",
    accent: "proposal",
    description: "The question, staged the way it deserves.",
  },
  {
    id: "wedding",
    name: "Wedding",
    accent: "wedding",
    description: "One address for the whole story, before and after the day.",
  },
];

export const featuredTemplates: MemoryTemplate[] = [
  { id: "birthday", name: "Birthday", accent: "birthday", description: "Countdown, photo timeline, wish wall." },
  { id: "proposal", name: "Proposal", accent: "proposal", description: "A slow reveal, built for one answer." },
  { id: "wedding", name: "Wedding", accent: "wedding", description: "Invites, RSVPs, and the story in one place." },
  { id: "anniversary", name: "Anniversary", accent: "anniversary", description: "Every year, layered into one page." },
  { id: "proposal", name: "Valentine", accent: "anniversary", description: "A love letter that moves." },
  { id: "birthday", name: "Graduation", accent: "wedding", description: "The chapter closing, done properly." },
];

export const whyChooseUs = [
  {
    title: "AI Personalization",
    description: "Describe the moment. Momently writes the words, picks the pacing, and matches the mood.",
  },
  {
    title: "Create in 5 Minutes",
    description: "No design skills, no blank page. Answer a few prompts and watch it come together.",
  },
  {
    title: "Custom URL",
    description: "yourname.momently.com — a real address for a memory that deserves one.",
  },
  {
    title: "Premium Animations",
    description: "Cinematic transitions, built once by us, so every page feels considered, not templated.",
  },
];

export const howItWorks = [
  { step: "01", title: "Choose Occasion", description: "Birthday, proposal, anniversary, or something entirely your own." },
  { step: "02", title: "Choose Template", description: "Pick the shape your story takes — we'll handle the structure." },
  { step: "03", title: "Customize", description: "Add photos, words, and music until it feels unmistakably yours." },
  { step: "04", title: "Share", description: "One link. Send it, or save it for the moment it's meant for." },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ananya R.",
    role: "Built a proposal page",
    quote: "He proposed with a link instead of a ring box opening first. I read it three times before I even looked up.",
    occasion: "Proposal",
  },
  {
    id: "t2",
    name: "Kabir M.",
    role: "Built an anniversary page",
    quote: "Five years, five scenes, one page. My wife thought I'd hired a studio.",
    occasion: "Anniversary",
  },
  {
    id: "t3",
    name: "Simran K.",
    role: "Built a birthday page",
    quote: "Turned forty photos into something that actually felt like a gift, not a slideshow.",
    occasion: "Birthday",
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₹0",
    cadence: "one page, free forever",
    description: "For a single memory, done simply.",
    features: ["1 memory page", "Standard templates", "Momently subdomain", "Basic animations"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "₹499",
    cadence: "per page",
    description: "For the moments that need a little more care.",
    features: ["Unlimited edits", "All templates", "Custom subdomain", "Premium animations", "Music & video"],
    highlighted: true,
  },
  {
    id: "creator",
    name: "Creator",
    price: "₹1,999",
    cadence: "per month",
    description: "For planners and studios building for others.",
    features: ["Unlimited pages", "White-label option", "Priority rendering", "Team seats", "Analytics"],
  },
];

export const faqItems: FaqItem[] = [
  {
    id: "f1",
    question: "Do I need any design experience?",
    answer: "No. You choose a template and answer a few prompts — Momently handles layout, pacing, and motion.",
  },
  {
    id: "f2",
    question: "Can I use my own domain?",
    answer: "Yes, on Premium and Creator plans you can point a custom domain at your memory page.",
  },
  {
    id: "f3",
    question: "How long does a page stay live?",
    answer: "Free pages stay live indefinitely. You can take a page down or archive it any time from your dashboard.",
  },
  {
    id: "f4",
    question: "Can I edit a page after sharing it?",
    answer: "Yes — edits publish instantly, so you can keep adding to a memory as it grows.",
  },
];
