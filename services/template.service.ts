import { templateRepository, type TemplateFilters } from "@/repositories/template.repository";
import { marketplaceTemplates } from "@/lib/marketplace-data";
import { NotFoundError, ValidationError } from "@/lib/errors";
import type { Template, Prisma } from "@prisma/client";
import type { CreateTemplateInput, UpdateTemplateInput } from "@/validators/template.schema";

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

  // ---- Admin Panel additions below — existing methods above are untouched ----

  getAllTemplatesForAdmin(): Promise<Template[]> {
    return templateRepository.findAllForAdmin();
  },

  createTemplate(input: CreateTemplateInput): Promise<Template> {
    return templateRepository.create({
      title: input.title,
      slug: input.slug,
      category: input.category,
      thumbnail: input.thumbnail,
      previewImages: [],
      description: input.description,
      isPremium: input.isPremium,
      price: input.price,
      isEnabled: input.isEnabled,
      isFeatured: input.isFeatured,
    });
  },

  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<Template> {
    const existing = await templateRepository.findById(id);
    if (!existing) throw new NotFoundError("Template not found.");

    const data: Prisma.TemplateUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.category !== undefined) data.category = input.category;
    if (input.thumbnail !== undefined) data.thumbnail = input.thumbnail;
    if (input.description !== undefined) data.description = input.description;
    if (input.isPremium !== undefined) data.isPremium = input.isPremium;
    if (input.price !== undefined) data.price = input.price;
    if (input.isEnabled !== undefined) data.isEnabled = input.isEnabled;
    if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;

    return templateRepository.update(id, data);
  },

  async deleteTemplate(id: string): Promise<void> {
    const existing = await templateRepository.findById(id);
    if (!existing) throw new NotFoundError("Template not found.");

    try {
      await templateRepository.delete(id);
    } catch {
      // Template → Project uses onDelete: Restrict (see schema.prisma) —
      // a template with existing projects can't be hard-deleted. Disabling
      // it is the correct move instead (hides it from the Marketplace
      // without breaking projects that already reference it).
      throw new ValidationError(
        "This template is used by existing projects and can't be deleted. Disable it instead."
      );
    }
  },
};
