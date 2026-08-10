"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

/** Matches the existing input/button sizing on the Login/Signup pages —
 * not a new style, just a secondary (outlined) variant of the same shape. */
export function GoogleSignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    // Only shows the button when GOOGLE_CLIENT_ID/SECRET are actually set
    // server-side — never a dead button that fails when clicked.
    getProviders().then((providers) => {
      setAvailable(Boolean(providers?.google));
    });
  }, []);

  if (!available) return null;

  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/10 dark:bg-paper/15" />
        <span className="text-xs text-ink/40 dark:text-paper/40">or</span>
        <span className="h-px flex-1 bg-ink/10 dark:bg-paper/15" />
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full flex items-center justify-center gap-2.5 rounded-full border border-ink/15 dark:border-paper/20 bg-paper dark:bg-ink-soft text-sm font-medium text-ink dark:text-paper py-3 hover:border-love/40 dark:hover:border-blush/40 transition-colors"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A12 12 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.99-3.11Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l3.99 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
          />
        </svg>
        Continue with Google
      </button>
    </>
  );
}
