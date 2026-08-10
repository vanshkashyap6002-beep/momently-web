import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/AdminPanel/AdminShell";

// Explicit, even though getServerSession() reading cookies already
// implicitly forces this — this route deals with per-user, per-request
// data and must never be statically cached.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Momently",
  // Deliberately not linked anywhere in the app's nav/footer/sitemap;
  // robots meta is an extra layer against it showing up in search results.
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Middleware (see middleware.ts) already redirects unauthenticated
  // visitors to /login and returns 403 for signed-in non-admins before
  // this layout ever runs. This check is a second, independent line of
  // defense at the server-component level — "never trust a single layer"
  // — not the primary gate.
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin-panel");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-ink px-6 text-center">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1 className="mt-3 font-display text-2xl text-ink dark:text-paper">403 — Forbidden</h1>
          <p className="mt-2 text-sm text-ink/55 dark:text-paper/55">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <AdminShell adminName={session.user.name ?? session.user.email ?? "Admin"}>{children}</AdminShell>;
}
