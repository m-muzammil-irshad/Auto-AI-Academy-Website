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
      <div className="flex min-h-screen bg-[#e8ecf4] dark:bg-[#10131d] transition-colors">
        <aside className="hidden w-64 shrink-0 border-r border-white/60 dark:border-white/5 bg-[#e8ecf4] dark:bg-[#10131d] shadow-[4px_0_20px_rgba(163,177,198,0.25)] dark:shadow-[4px_0_25px_rgba(0,0,0,0.85)] md:block">
          <div className="flex h-16 items-center border-b border-black/5 dark:border-white/5 px-6">
            <Link
              href="/admin"
              className="font-heading text-lg font-bold text-slate-900 dark:text-white"
            >
              {SITE_NAME} · Admin
            </Link>
          </div>
          <AdminSidebar />
        </aside>

        <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <div className="flex h-16 items-center border-b border-black/5 dark:border-white/5 px-6">
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="font-heading text-lg font-bold text-slate-900 dark:text-white"
            >
              {SITE_NAME} · Admin
            </Link>
          </div>
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </MobileNav>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/60 dark:border-white/5 bg-[#e8ecf4]/95 dark:bg-[#10131d]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(163,177,198,0.25)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.85)] px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="neu-btn inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 dark:text-slate-300 md:hidden"
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