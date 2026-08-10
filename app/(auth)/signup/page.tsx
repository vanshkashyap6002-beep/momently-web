"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { GoogleSignInButton } from "@/components/AuthGoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Account created — please sign in.");
      router.push("/login");
      return;
    }

    router.push("/marketplace");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl text-love dark:text-blush">
          Momently
        </Link>
        <h1 className="mt-8 font-display text-2xl text-ink dark:text-paper">Create your account</h1>
        <p className="mt-1 text-sm text-ink/55 dark:text-paper/55">
          Start building a memory page in minutes.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="block text-xs text-ink/60 dark:text-paper/60 mb-1.5">Name</span>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink-soft px-3 py-2.5 text-sm text-ink dark:text-paper focus:outline-none focus:ring-2 focus:ring-love/30 dark:focus:ring-blush/30"
            />
          </label>
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
            <span className="block text-xs text-ink/60 dark:text-paper/60 mb-1.5">
              Password <span className="text-ink/40 dark:text-paper/40">(min. 8 characters)</span>
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <GoogleSignInButton callbackUrl="/marketplace" />

        <p className="mt-6 text-sm text-ink/55 dark:text-paper/55">
          Already have an account?{" "}
          <Link href="/login" className="text-love dark:text-blush hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
