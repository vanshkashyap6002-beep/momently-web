import { templateRepository, type TemplateFilters } from "@/repositories/template.repository";
import { marketplaceTemplates } from "@/lib/marketplace-data";
import { NotFoundError } from "@/lib/errors";
import type { Template } from "@prisma/client";

export const templateService = {
  getTemplates(filters: TemplateFilters): Promise<Template[]> {
    return templateRepository.findMany(filters);
  },

  async getTemplateBySlug(slug: string): Promise<Template> {
    const template = await templateRepository.findBySlug(slug);
    if (!template) throw new NotFoundError("Template not found.");
    return template;
  },

  async getTemplateById(id: string): Promise<Template> {
    const template = await templateRepository.findById(id);
    if (!template) throw new NotFoundError("Template not found.");
    return template;
  },

  /**
   * Bridges the Marketplace's dummy-JSON templates (`lib/marketplace-data.ts`)
   * onto real `Template` rows: the Studio's route param is a marketplace
   * slug, not a database id, so the first time a given template is actually
   * used to build a Project, a matching `Template` row is created from the
   * dummy data and reused on every subsequent save. Not a general "create
   * template" API — a one-time compatibility shim for the Marketplace/
   * Studio boundary until the Marketplace itself reads from the database.
   */
  async ensureTemplateFromMarketplaceSlug(slug: string): Promise<string> {
    const existing = await templateRepository.findBySlug(slug);
    if (existing) return existing.id;

    const dummy = marketplaceTemplates.find((t) => t.slug === slug);

    const created = await templateRepository.create({
      slug,
      title: dummy?.name ?? "Untitled Template",
      category: dummy?.occasion ?? "General",
      thumbnail: dummy
        ? `https://picsum.photos/seed/${dummy.previewImageSeed}/640/480`
        : `https://picsum.photos/seed/${slug}/640/480`,
      previewImages: [],
      description: dummy ? `${dummy.style} template in the ${dummy.occasion} category.` : "",
      isPremium: (dummy?.price ?? 0) > 0,
      price: dummy?.price ?? 0,
    });

    return created.id;
  },
};
