import type { Metadata } from "next";
import type { CSSProperties } from "react";
// Self-hosted via @fontsource instead of next/font/google: identical font
// families/weights (Playfair Display 500/600/700, Inter 400/500/600), but
// the actual font files ship inside the npm package and are bundled at
// build time like any other static asset — no fetch to Google's servers
// during `next build`. That external fetch was the sole cause of the
// production build failures ("Failed to fetch font file from
// fonts.gstatic.com"); this removes the dependency entirely rather than
// hoping the network is reliable on any given build.
import "@fontsource/playfair-display/latin-500.css";
import "@fontsource/playfair-display/latin-600.css";
import "@fontsource/playfair-display/latin-700.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "./globals.css";
import { Providers } from "./providers";

// Same CSS custom properties Tailwind already reads (see
// tailwind.config.ts's fontFamily.display / fontFamily.body) — only the
// mechanism supplying their values changed, not the variables themselves,
// so nothing downstream (Tailwind config, any component using font-display
// / font-body classes) needs to change.
const fontVariables = {
  "--font-playfair": "'Playfair Display', serif",
  "--font-inter": "'Inter', sans-serif",
} as CSSProperties;

export const metadata: Metadata = {
  title: "Momently — Every Memory Deserves Its Own Place on the Internet",
  description:
    "Create beautiful, interactive memory websites for birthdays, anniversaries, proposals, and every unforgettable moment.",
  metadataBase: new URL("https://momently.com"),
  openGraph: {
    title: "Momently",
    description:
      "Create beautiful, interactive memory websites for birthdays, anniversaries, proposals, and every unforgettable moment.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={fontVariables} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
