import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { communityTemplateService } from "@/services/community-template.service";
import { CreatorTemplateForm } from "@/components/CreatorTemplateForm";
import { NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export default async function EditMyTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/account/templates/${id}`);
  }

  const template = await communityTemplateService.getMyTemplate(session.user.id, id).catch((err) => {
    if (err instanceof NotFoundError) return null;
    throw err;
  });

  if (!template) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-2xl">
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest">Edit Template</h1>

          <div className="mt-8">
            <CreatorTemplateForm template={template} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
