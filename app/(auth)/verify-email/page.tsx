"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { verifyEmail } from "@/app/actions/account.actions";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This link is missing its token.");
      return;
    }
    verifyEmail({ token }).then((result) => {
      if (result.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(result.error);
      }
    });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper dark:bg-ink px-6">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="font-display text-2xl text-love dark:text-blush">
          Momently
        </Link>

        <div className="mt-10">
          {status === "checking" && (
            <div className="flex flex-col items-center gap-3 text-ink/60 dark:text-paper/60">
              <Loader2 className="h-6 w-6 animate-spin text-love dark:text-blush" />
              <p className="text-sm">Verifying your email…</p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <p className="text-sm text-ink dark:text-paper">Your email is verified.</p>
              <Link
                href="/marketplace"
                className="mt-2 rounded-full bg-love px-6 py-2.5 text-sm font-medium text-paper hover:bg-love-dark transition-colors"
              >
                Continue to Marketplace
              </Link>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <XCircle className="h-6 w-6 text-love dark:text-blush" />
              <p className="text-sm text-ink/70 dark:text-paper/70">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
