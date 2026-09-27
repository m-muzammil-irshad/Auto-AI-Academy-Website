"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { SITE_NAME } from "@/lib/constants";

export function SiteHeader() {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const portalHref = profile?.role === "admin" ? "/admin" : "/student";
  const signedIn = !!user && !!profile;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-heading text-lg font-semibold text-slate-900"
        >
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/courses"
            className="text-sm text-slate-700 hover:text-slate-900"
          >
            Courses
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm text-slate-700 hover:text-slate-900"
          >
            How it works
          </Link>
          <Link
            href="/#why"
            className="text-sm text-slate-700 hover:text-slate-900"
          >
            Why us
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <Link href={portalHref}>
              <Button size="sm">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 md:hidden"
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

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <Link
              href="/courses"
              onClick={() => setMobileOpen(false)}
              className="rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Courses
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              How it works
            </Link>
            <Link
              href="/#why"
              onClick={() => setMobileOpen(false)}
              className="rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Why us
            </Link>
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-200 pt-3">
              {signedIn ? (
                <Link href={portalHref} onClick={() => setMobileOpen(false)}>
                  <Button size="md" className="w-full">
                    Go to dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button size="md" className="w-full">
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