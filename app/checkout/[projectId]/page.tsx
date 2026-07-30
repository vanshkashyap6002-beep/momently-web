import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { projectService } from "@/services/project.service";
import { templateService } from "@/services/template.service";
import { CheckoutClient } from "@/components/Checkout/CheckoutClient";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/checkout/${projectId}`);
  }

  const project = await projectService.getProject(session.user.id, projectId);
  const template = await templateService.getTemplateById(project.templateId);

  if (project.status === "PUBLISHED") {
    redirect(`/customize/${template.slug}`);
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-lg">
          <p className="eyebrow">Checkout</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest">
            Unlock &amp; publish your memory
          </h1>
          <p className="mt-3 text-sm text-ink/60 dark:text-paper/60">
            {template.title} is a premium template — a one-time payment unlocks publishing
            for &ldquo;{project.title}&rdquo;.
          </p>

          <CheckoutClient
            projectId={project.id}
            projectTitle={project.title}
            templateTitle={template.title}
            priceLabel={`₹${Number(template.price).toLocaleString("en-IN")}`}
            customizeUrl={`/customize/${template.slug}`}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
