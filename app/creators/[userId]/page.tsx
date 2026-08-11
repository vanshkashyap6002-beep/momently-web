import { notFound } from "next/navigation";
import { BadgeCheck, LayoutTemplate, Download, CalendarDays } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { profileService } from "@/services/profile.service";
import { NotFoundError } from "@/lib/errors";
import { ReportButton } from "@/components/ReportButton";

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const profile = await profileService.getPublicProfile(userId).catch((err) => {
    if (err instanceof NotFoundError) return null;
    throw err;
  });

  if (!profile) notFound();

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-lg text-center">
          <div className="mx-auto h-20 w-20 rounded-full bg-blush/40 dark:bg-ink-soft flex items-center justify-center">
            <span className="font-display text-2xl text-love dark:text-blush">
              {profile.displayName.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5">
            <h1 className="font-display text-2xl md:text-3xl text-ink dark:text-paper">
              {profile.displayName}
            </h1>
            {profile.isVerified && (
              <BadgeCheck className="h-5 w-5 text-love dark:text-blush" aria-label="Verified creator" />
            )}
          </div>

          {profile.bio && (
            <p className="mt-3 text-sm text-ink/60 dark:text-paper/60 max-w-sm mx-auto">{profile.bio}</p>
          )}

          <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink/45 dark:text-paper/45">
            <CalendarDays className="h-3.5 w-3.5" />
            Joined {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5">
              <LayoutTemplate className="h-4 w-4 text-love dark:text-blush mx-auto" />
              <p className="mt-2 font-display text-xl text-ink dark:text-paper">
                {profile.publishedTemplateCount}
              </p>
              <p className="text-xs text-ink/50 dark:text-paper/50">Published Templates</p>
            </div>
            <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5">
              <Download className="h-4 w-4 text-love dark:text-blush mx-auto" />
              <p className="mt-2 font-display text-xl text-ink dark:text-paper">{profile.downloadCount}</p>
              <p className="text-xs text-ink/50 dark:text-paper/50">Downloads</p>
            </div>
          </div>

          {profile.publishedTemplateCount === 0 && (
            <p className="mt-6 text-xs text-ink/40 dark:text-paper/40">
              No published templates yet.
            </p>
          )}

          <div className="mt-8 flex justify-center">
            <ReportButton targetType="CREATOR" targetUserId={userId} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
