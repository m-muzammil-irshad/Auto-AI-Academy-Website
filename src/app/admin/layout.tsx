"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { UserMenu } from "@/components/layout/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE_NAME } from "@/lib/constants";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RoleGuard required="admin">
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md md:block">
          <div className="flex h-16 items-center border-b border-slate-200/50 dark:border-slate-800/50 px-4">
            <Link
              href="/admin"
              className="font-heading text-base font-semibold text-slate-900 dark:text-white"
            >
              {SITE_NAME} · Admin
            </Link>
          </div>
          <AdminSidebar />
        </aside>

        <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <div className="flex h-16 items-center border-b border-slate-200/50 dark:border-slate-800/50 px-4">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="font-heading text-base font-semibold text-slate-900 dark:text-white"
            >
              {SITE_NAME} · Admin
            </Link>
          </div>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </MobileNav>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
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
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden md:block" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu profileHref="/admin/settings" />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}