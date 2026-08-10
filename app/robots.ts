import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://momently.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Never crawled/indexed: auth flows, the Studio (per-user drafts),
        // checkout, and the Admin Panel (already kept out of all nav/
        // sitemap/search per its own spec — this is the crawler-facing
        // equivalent of that same rule).
        disallow: [
          "/customize/",
          "/checkout/",
          "/admin-panel",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
