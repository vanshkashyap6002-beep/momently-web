import { templateService } from "@/services/template.service";
import { marketplaceTemplates } from "@/lib/marketplace-data";
import { MarketplaceClient } from "@/components/marketplace/marketplace-client";

// Now reads real approved templates from the database in addition to the
// static seed set (audit finding C2) — force-dynamic for the same reason
// as this project's other DB-touching routes: prevents Next.js from
// attempting to run this at BUILD time, when the database isn't reachable
// (see the identical comment on app/api/auth/[...nextauth]/route.ts).
export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const dbTemplates = await templateService.getMarketplaceTemplates();

  // Merge real approved templates with the original curated seed set
  // rather than replacing it, so nothing visible today disappears. In the
  // unlikely event a real template's slug collides with a seed slug, the
  // real one wins — one source of truth per slug.
  const dbSlugs = new Set(dbTemplates.map((t) => t.slug));
  const templates = [...marketplaceTemplates.filter((t) => !dbSlugs.has(t.slug)), ...dbTemplates];

  return <MarketplaceClient templates={templates} />;
}
