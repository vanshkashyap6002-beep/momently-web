"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { resetPassword } from "@/app/actions/account.actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await resetPassword({ token, password });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-love dark:text-blush">
          Momently
        </Link>
        <h1 className="mt-8 font-display text-2xl text-ink dark:text-paper">Set a new password</h1>

        {!token ? (
          <p className="mt-8 text-sm text-love dark:text-blush">
            This link is missing its token. Please use the link from your email.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="block text-xs text-ink/60 dark:text-paper/60 mb-1.5">
                New password <span className="text-ink/40 dark:text-paper/40">(min. 8 characters)</span>
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink-soft px-3 py-2.5 text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-love/30 dark:focus:ring-blush/30"
              />
            </label>

            {error && <p className="text-xs text-love dark:text-blush">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-love text-paper text-sm font-medium py-3 hover:bg-love-dark transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
