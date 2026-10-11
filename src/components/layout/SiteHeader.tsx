"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Brand } from "@/components/layout/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils/cn";
import { DURATION, EASE } from "@/lib/motion";

const NAV_LINKS = [
  { href: "/#home", label: "Home", section: "home" },
  { href: "/#courses", label: "Courses", section: "courses" },
  { href: "/blog", label: "Blog" },
  { href: "/#how-it-works", label: "How it works", section: "how-it-works" },
  { href: "/#why", label: "Why us", section: "why" },
];

/** Tracks which home-page section is under the header, and whether the page has scrolled. */
function useHeaderState(onHome: boolean) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) {
      setActiveSection(null);
      return;
    }
    const sections = NAV_LINKS.flatMap((l) => (l.section ? [l.section] : []))
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    // A section is "active" while it crosses a thin band just below the header.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onHome]);

  return { scrolled, activeSection };
}

export function SiteHeader() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrolled, activeSection } = useHeaderState(pathname === "/");

  const portalHref = profile?.role === "admin" ? "/admin" : "/student";
  const signedIn = !!user && !!profile;

  const isActive = (link: (typeof NAV_LINKS)[number]) =>
    link.section ? activeSection === link.section : pathname.startsWith(link.href);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-[box-shadow,border-color] duration-300",
        scrolled
          ? "border-slate-200/80 shadow-sm shadow-slate-900/5 dark:border-slate-800/80 dark:shadow-black/20"
          : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Brand />

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link) ? "true" : undefined}
              className="nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {signedIn ? (
            <Link href={portalHref}>
              <Button size="sm" className="rounded-full">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full dark:text-slate-300 dark:hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-full shadow-md hover:shadow-lg hover:shadow-accent-500/25 dark:shadow-accent-500/20">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.ui, ease: EASE }}
            className="overflow-hidden border-t border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-950 md:hidden"
          >
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:hover:text-white",
                    isActive(link)
                      ? "text-accent-600 dark:text-accent-400"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-slate-200/50 pt-3 dark:border-slate-800/50">
                {signedIn ? (
                  <Link href={portalHref} onClick={() => setMobileOpen(false)}>
                    <Button size="md" className="w-full rounded-full">
                      Go to dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="secondary" size="md" className="w-full rounded-full">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileOpen(false)}>
                      <Button size="md" className="w-full rounded-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
