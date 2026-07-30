import Link from "next/link";
import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 dark:border-paper/10 py-16">
      <div className="container-page flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
        <div>
          <p className="font-display text-3xl text-love dark:text-blush">Momently</p>
          <p className="mt-3 text-sm text-ink/55 dark:text-paper/55 max-w-xs">
            Every memory deserves its own place on the internet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-10 sm:gap-16 text-sm">
          <div className="flex flex-col gap-2">
            <span className="text-ink/40 dark:text-paper/40 text-xs uppercase tracking-wider mb-1">Product</span>
            <Link href="#marketplace" className="text-ink/65 dark:text-paper/65 hover:text-love dark:hover:text-blush">Marketplace</Link>
            <Link href="#pricing" className="text-ink/65 dark:text-paper/65 hover:text-love dark:hover:text-blush">Pricing</Link>
            <Link href="#how-it-works" className="text-ink/65 dark:text-paper/65 hover:text-love dark:hover:text-blush">How it Works</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-ink/40 dark:text-paper/40 text-xs uppercase tracking-wider mb-1">Company</span>
            <Link href="#" className="text-ink/65 dark:text-paper/65 hover:text-love dark:hover:text-blush">About</Link>
            <Link href="#" className="text-ink/65 dark:text-paper/65 hover:text-love dark:hover:text-blush">Contact</Link>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="#" aria-label="Instagram" className="text-ink/50 dark:text-paper/50 hover:text-love dark:hover:text-blush">
            <Instagram className="h-5 w-5" />
          </Link>
          <Link href="#" aria-label="Twitter" className="text-ink/50 dark:text-paper/50 hover:text-love dark:hover:text-blush">
            <Twitter className="h-5 w-5" />
          </Link>
          <Link href="#" aria-label="YouTube" className="text-ink/50 dark:text-paper/50 hover:text-love dark:hover:text-blush">
            <Youtube className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="container-page mt-12 pt-6 border-t border-ink/5 dark:border-paper/5 text-xs text-ink/40 dark:text-paper/40">
        © {new Date().getFullYear()} Momently. All rights reserved.
      </div>
    </footer>
  );
}
