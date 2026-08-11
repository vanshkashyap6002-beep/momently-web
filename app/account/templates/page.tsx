import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { Plus } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { communityTemplateService } from "@/services/community-template.service";
import { MyTemplatesTable } from "@/components/MyTemplatesTable";

export const dynamic = "force-dynamic";

export default async function MyTemplatesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/templates");
  }

  const templates = await communityTemplateService.getMyTemplates(session.user.id);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Account</p>
              <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest">My Templates</h1>
              <p className="mt-3 text-sm text-ink/60 dark:text-paper/60">
                Submitted templates go through admin review before appearing in the Marketplace.
              </p>
              <Link href="/account/profile" className="mt-2 inline-block text-xs text-love dark:text-blush hover:underline">
                ← Back to profile
              </Link>
            </div>
          </div>

          <Link
            href="/account/templates/new"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-love px-5 py-2.5 text-sm font-medium text-paper hover:bg-love-dark transition-colors"
          >
            <Plus className="h-4 w-4" /> New Template
          </Link>

          <div className="mt-8">
            <MyTemplatesTable templates={templates} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
