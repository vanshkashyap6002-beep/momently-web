import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Love Red — the brand's emotional core, never bright
        love: {
          DEFAULT: "#7A1E2B",
          dark: "#5C1620",
          light: "#94303F",
        },
        // Soft Pink — secondary, used sparingly as warmth not decoration
        blush: {
          DEFAULT: "#F1D6D9",
          dark: "#E4B9BE",
        },
        // Warm paper white, not stark
        paper: "#FDFBF9",
        // Near-black for dark mode, warm not blue-black
        ink: {
          DEFAULT: "#12100F",
          soft: "#1C1918",
        },
        // Template accent colors
        template: {
          birthday: "#3E6D9C",
          anniversary: "#C97B92",
          proposal: "#8C1D2B",
          wedding: "#B8964F",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      boxShadow: {
        card: "0 20px 60px -15px rgba(122, 30, 43, 0.25)",
        "card-dark": "0 20px 60px -15px rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
