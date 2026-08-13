import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CreatorTemplateForm } from "@/components/CreatorTemplateForm";

export const dynamic = "force-dynamic";

export default async function NewMyTemplatePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/templates/new");
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-2xl">
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest">New Template</h1>

          <div className="mt-8">
            <CreatorTemplateForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
