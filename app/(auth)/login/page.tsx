"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/marketplace";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Incorrect email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-love dark:text-blush">
          Momently
        </Link>
        <h1 className="mt-8 font-display text-2xl text-ink dark:text-paper">Welcome back</h1>
        <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">
          Sign in to keep customizing your memory pages.
        </p>

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
          <label className="block">
            <span className="flex items-center justify-between mb-1.5">
              <span className="block text-xs text-ink/60 dark:text-paper/60">Password</span>
              <Link href="/forgot-password" className="text-xs text-love dark:text-blush hover:underline">
                Forgot password?
              </Link>
            </span>
            <input
              type="password"
              required
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink/55 dark:text-paper/55">
          New to Momently?{" "}
          <Link href="/signup" className="text-love dark:text-blush hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
