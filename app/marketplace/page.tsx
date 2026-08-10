import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { marketplaceTemplates } from "@/lib/marketplace-data";

export function generateStaticParams() {
  return marketplaceTemplates.map((t) => ({ slug: t.slug }));
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = marketplaceTemplates.find((t) => t.slug === slug);

  if (!template) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-page grid md:grid-cols-2 gap-12 items-start">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden">
            <Image
              src={`https://picsum.photos/seed/${template.previewImageSeed}/900/700`}
              alt={`${template.name} preview`}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <p className="eyebrow">{template.occasion}</p>
            <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest">
              {template.name}
            </h1>
            <p className="mt-3 text-sm text-ink/60 dark:text-paper/60">
              By {template.creator.name} &middot; {template.style} &middot; {template.mood}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span className="font-display text-2xl text-ink dark:text-paper">
                {template.price === 0 ? "Free" : `₹${template.price}`}
              </span>
              <Link
                href={`/customize/${template.slug}`}
                className="rounded-full bg-love px-7 py-3 text-sm font-medium text-paper hover:bg-love-dark transition-colors"
              >
                Use Template
              </Link>
              <Link
                href="/marketplace"
                className="text-sm text-ink/60 dark:text-paper/60 hover:text-love dark:hover:text-blush"
              >
                Back to Marketplace
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
