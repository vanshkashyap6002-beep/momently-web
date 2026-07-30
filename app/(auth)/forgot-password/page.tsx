"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { requestPasswordReset } from "@/app/actions/account.actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await requestPasswordReset({ email });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-love dark:text-blush">
          Momently
        </Link>
        <h1 className="mt-8 font-display text-2xl text-ink dark:text-paper">Forgot your password?</h1>
        <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">
          Enter your email and we'll send you a reset link.
        </p>

        {sent ? (
          <p className="mt-8 text-sm text-ink/70 dark:text-paper/70">
            If an account exists for that email, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="block text-xs text-ink/60 dark:text-paper/60 mb-1.5">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-ink/55 dark:text-paper/55">
          <Link href="/login" className="text-love dark:text-blush hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
