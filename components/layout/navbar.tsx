"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Pricing", href: "/#pricing" },
  { label: "How it Works", href: "/#how-it-works" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open, and always close it
  // when the viewport grows back to desktop size.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-500",
        scrolled || mobileOpen ? "glass-nav" : "bg-transparent"
      )}
    >
      <div className="container-page flex h-20 items-center justify-between">
        <Link
          href="/#home"
          onClick={() => setMobileOpen(false)}
          className="font-display text-xl font-semibold tracking-tight text-love dark:text-blush"
        >
          Momently
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink/70 hover:text-love dark:text-paper/70 dark:hover:text-blush transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="hidden sm:flex" />
          <Link
            href="/login"
            className="hidden sm:inline-block text-sm font-medium text-ink/70 hover:text-love dark:text-paper/70 dark:hover:text-blush transition-colors"
          >
            Login
          </Link>
          <Link
            href="/marketplace"
            className="hidden sm:inline-block rounded-full bg-love px-5 py-2.5 text-sm font-medium text-paper shadow-card hover:bg-love-dark transition-colors"
          >
            Create Memory
          </Link>

          {/* Mobile nav toggle — links collapse under md:, this is the only
              way to reach them (and Login/Create Memory) below that breakpoint. */}
          <button
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-full text-ink/70 hover:bg-ink/5 dark:text-paper/70 dark:hover:bg-paper/10 transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden glass-nav border-t border-ink/5 dark:border-paper/10"
          >
            <nav className="container-page flex flex-col py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 text-base text-ink/80 hover:text-love dark:text-paper/80 dark:hover:text-blush transition-colors border-b border-ink/5 dark:border-paper/5"
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center justify-between pt-4">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium text-ink/70 hover:text-love dark:text-paper/70 dark:hover:text-blush transition-colors"
                >
                  Login
                </Link>
                <ThemeToggle />
              </div>

              <Link
                href="/marketplace"
                onClick={() => setMobileOpen(false)}
                className="mt-4 rounded-full bg-love px-5 py-3 text-center text-sm font-medium text-paper shadow-card hover:bg-love-dark transition-colors"
              >
                Create Memory
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
