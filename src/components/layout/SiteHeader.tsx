"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { SITE_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const portalHref = profile?.role === "admin" ? "/admin" : "/student";
  const signedIn = !!user && !!profile;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-slate-900 dark:text-white"
        >
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/#home"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/#courses"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Courses
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            How it works
          </Link>
          <Link
            href="/#why"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            Why us
          </Link>
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
                <Button size="sm" className="rounded-full shadow-md transition-all hover:shadow-lg hover:shadow-accent-500/25 dark:shadow-accent-500/20">Get Started</Button>
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
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

      {mobileOpen && (
        <div className="border-t border-slate-200/50 bg-white dark:border-slate-800/50 dark:bg-slate-950 md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <Link
              href="/#home"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/#courses"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
            >
              Courses
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
            >
              How it works
            </Link>
            <Link
              href="/#why"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-white"
            >
              Why us
            </Link>
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
        </div>
      )}
    </header>
  );
}