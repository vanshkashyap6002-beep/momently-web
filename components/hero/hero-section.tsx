import Link from "next/link";
import { HeroCardStack } from "./hero-card-stack";

export function HeroSection() {
  return (
    <section id="home" className="relative pt-40 pb-24 md:pt-52 md:pb-32 overflow-hidden">
      <div className="container-page grid md:grid-cols-2 gap-16 md:gap-8 items-center">
        <div>
          <p className="eyebrow mb-6">Momently</p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] leading-[1.08] tracking-tightest text-ink dark:text-paper">
            Every Memory Deserves Its Own Place on the Internet.
          </h1>
          <p className="mt-6 text-base md:text-lg text-ink/65 dark:text-paper/65 max-w-md leading-relaxed">
            Create beautiful interactive memory websites for birthdays, anniversaries,
            proposals, and every unforgettable moment.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/marketplace"
              className="rounded-full bg-love px-7 py-3.5 text-sm font-medium text-paper shadow-card hover:bg-love-dark transition-colors"
            >
              Create Memory
            </Link>
            <Link
              href="/marketplace"
              className="rounded-full border border-ink/15 dark:border-paper/20 px-7 py-3.5 text-sm font-medium text-ink dark:text-paper hover:border-love/40 hover:text-love dark:hover:text-blush transition-colors"
            >
              Explore Templates
            </Link>
          </div>
        </div>

        <HeroCardStack />
      </div>
    </section>
  );
}
