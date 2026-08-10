import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { profileService } from "@/services/profile.service";
import { ProfileForm } from "@/components/ProfileForm";

// Per-user private data — never statically cached.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/profile");
  }

  const profile = await profileService.getOrCreateMyProfile(session.user.id);

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="container-page max-w-lg">
          <p className="eyebrow">Account</p>
          <h1 className="mt-3 font-display text-3xl md:text-4xl tracking-tightest">Your Profile</h1>
          <p className="mt-3 text-sm text-ink/60 dark:text-paper/60">
            Personal details stay private by default. Only what you choose to make public — and only
            when you turn that on below — ever shows on your public creator page.
          </p>

          <div className="mt-10">
            <ProfileForm profile={profile} userId={session.user.id} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
