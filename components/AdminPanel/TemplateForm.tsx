"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createTemplate, updateTemplate } from "@/app/actions/admin.actions";
import type { Template } from "@prisma/client";

interface TemplateFormValues {
  title: string;
  slug: string;
  category: string;
  thumbnail: string;
  description: string;
  isPremium: boolean;
  price: number;
  isEnabled: boolean;
  isFeatured: boolean;
}

export function TemplateForm({ template }: { template?: Template }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    defaultValues: template
      ? {
          title: template.title,
          slug: template.slug,
          category: template.category,
          thumbnail: template.thumbnail,
          description: template.description,
          isPremium: template.isPremium,
          price: Number(template.price),
          isEnabled: template.isEnabled,
          isFeatured: template.isFeatured,
        }
      : {
          title: "",
          slug: "",
          category: "",
          thumbnail: "",
          description: "",
          isPremium: false,
          price: 0,
          isEnabled: true,
          isFeatured: false,
        },
  });

  const isPremium = watch("isPremium");

  async function onSubmit(values: TemplateFormValues) {
    setSubmitting(true);
    setError(null);

    const payload = { ...values, price: values.isPremium ? Number(values.price) : 0 };
    const result = template ? await updateTemplate(template.id, payload) : await createTemplate(payload);

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/admin-panel/templates");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink-soft px-3 py-2.5 text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-love/30 dark:focus:ring-blush/30";
  const labelClass = "block text-xs text-ink/60 dark:text-paper/60 mb-1.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <label className="block">
        <span className={labelClass}>Title</span>
        <input {...register("title", { required: "Title is required" })} className={inputClass} />
        {errors.title && <p className="mt-1 text-xs text-love dark:text-blush">{errors.title.message}</p>}
      </label>

      <label className="block">
        <span className={labelClass}>Slug</span>
        <input {...register("slug", { required: "Slug is required" })} className={inputClass} />
        {errors.slug && <p className="mt-1 text-xs text-love dark:text-blush">{errors.slug.message}</p>}
      </label>

      <label className="block">
        <span className={labelClass}>Category</span>
        <input {...register("category", { required: "Category is required" })} className={inputClass} />
        {errors.category && <p className="mt-1 text-xs text-love dark:text-blush">{errors.category.message}</p>}
      </label>

      <label className="block">
        <span className={labelClass}>Thumbnail URL</span>
        <input {...register("thumbnail", { required: "Thumbnail URL is required" })} className={inputClass} />
        {errors.thumbnail && (
          <p className="mt-1 text-xs text-love dark:text-blush">{errors.thumbnail.message}</p>
        )}
      </label>

      <label className="block">
        <span className={labelClass}>Description</span>
        <textarea rows={3} {...register("description", { required: "Description is required" })} className={inputClass} />
        {errors.description && (
          <p className="mt-1 text-xs text-love dark:text-blush">{errors.description.message}</p>
        )}
      </label>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-ink dark:text-paper">
          <input type="checkbox" {...register("isPremium")} className="accent-love dark:accent-blush" />
          Premium
        </label>
        <label className="flex items-center gap-2 text-sm text-ink dark:text-paper">
          <input type="checkbox" {...register("isEnabled")} className="accent-love dark:accent-blush" />
          Enabled
        </label>
        <label className="flex items-center gap-2 text-sm text-ink dark:text-paper">
          <input type="checkbox" {...register("isFeatured")} className="accent-love dark:accent-blush" />
          Featured
        </label>
      </div>

      {isPremium && (
        <label className="block">
          <span className={labelClass}>Price (₹)</span>
          <input
            type="number"
            min={0}
            step="1"
            {...register("price", { valueAsNumber: true, min: { value: 0, message: "Price can't be negative" } })}
            className={inputClass}
          />
          {errors.price && <p className="mt-1 text-xs text-love dark:text-blush">{errors.price.message}</p>}
        </label>
      )}

      {error && <p className="text-xs text-love dark:text-blush">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-full bg-love px-6 py-3 text-sm font-medium text-paper hover:bg-love-dark transition-colors disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {template ? "Save changes" : "Create template"}
      </button>
    </form>
  );
}
