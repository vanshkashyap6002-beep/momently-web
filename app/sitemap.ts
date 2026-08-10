import type { MetadataRoute } from "next";
import { marketplaceTemplates } from "@/lib/marketplace-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://momently.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/marketplace`, changeFrequency: "daily", priority: 0.9 },
  ];

  const templateRoutes: MetadataRoute.Sitemap = marketplaceTemplates.map((template) => ({
    url: `${baseUrl}/marketplace/${template.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...templateRoutes];
}
