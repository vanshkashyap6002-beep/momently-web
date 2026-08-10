"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Loader2, ExternalLink } from "lucide-react";
import { updateMyProfile } from "@/app/actions/profile.actions";
import { Switch } from "@/components/ui/switch";
import type { Profile } from "@prisma/client";

interface ProfileFormValues {
  displayName: string;
  bio: string;
  isPublic: boolean;
  birthday: string;
  anniversary: string;
  partnerName: string;
  emailNotifications: boolean;
}

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ProfileForm({ profile, userId }: { profile: Profile; userId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preferences = (profile.preferences as { emailNotifications?: boolean } | null) ?? {};

  const { register, handleSubmit, watch, setValue } = useForm<ProfileFormValues>({
    defaultValues: {
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      isPublic: profile.isPublic,
      birthday: toDateInputValue(profile.birthday),
      anniversary: toDateInputValue(profile.anniversary),
      partnerName: profile.partnerName ?? "",
      emailNotifications: preferences.emailNotifications ?? true,
    },
  });

  const isPublic = watch("isPublic");

  async function onSubmit(values: ProfileFormValues) {
    setSubmitting(true);
    setError(null);

    const result = await updateMyProfile({
      displayName: values.displayName,
      bio: values.bio,
      isPublic: values.isPublic,
      birthday: values.birthday,
      anniversary: values.anniversary,
      partnerName: values.partnerName,
      preferences: { emailNotifications: values.emailNotifications },
    });

    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  const inputClass =
    "w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink-soft px-3 py-2.5 text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-love/30 dark:focus:ring-blush/30";
  const labelClass = "block text-xs text-ink/60 dark:text-paper/60 mb-1.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink dark:text-paper">Public Creator Profile</h2>
          <label className="flex items-center gap-2 text-xs text-ink/60 dark:text-paper/60">
            Public
            <Switch
              checked={isPublic}
              onCheckedChange={(checked) => setValue("isPublic", checked, { shouldDirty: true })}
              label="Make profile public"
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Creator name</span>
          <input {...register("displayName")} placeholder="Shown instead of your account name" className={inputClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Bio</span>
          <textarea rows={3} {...register("bio")} className={inputClass} />
        </label>

        {isPublic && (
          <Link
            href={`/creators/${userId}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs text-love dark:text-blush hover:underline"
          >
            View your public profile <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-ink/10 dark:border-paper/10 bg-paper dark:bg-ink-soft p-5 space-y-4">
        <h2 className="text-sm font-medium text-ink dark:text-paper">Private Details</h2>
        <p className="text-xs text-ink/45 dark:text-paper/45">
          Never shown on your public profile — visible only to you.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={labelClass}>Birthday</span>
            <input type="date" {...register("birthday")} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Anniversary</span>
            <input type="date" {...register("anniversary")} className={inputClass} />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Partner&apos;s name</span>
          <input {...register("partnerName")} className={inputClass} />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-ink dark:text-paper">Email notifications</span>
          <input
            type="checkbox"
            {...register("emailNotifications")}
            className="accent-love dark:accent-blush h-4 w-4"
          />
        </label>
      </div>

      {error && <p className="text-xs text-love dark:text-blush">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 rounded-full bg-love px-6 py-3 text-sm font-medium text-paper hover:bg-love-dark transition-colors disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}
