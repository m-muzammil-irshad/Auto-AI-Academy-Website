"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { UserMenu } from "@/components/layout/UserMenu";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { SITE_NAME } from "@/lib/constants";

export default function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RoleGuard required="student">
      <div className="flex min-h-screen bg-slate-50">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
          <div className="flex h-16 items-center border-b border-slate-200 px-4">
            <Link
              href="/student"
              className="font-heading text-base font-semibold text-slate-900"
            >
              {SITE_NAME}
            </Link>
          </div>
          <StudentSidebar />
        </aside>

        <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <div className="flex h-16 items-center border-b border-slate-200 px-4">
            <Link
              href="/student"
              onClick={() => setMobileOpen(false)}
              className="font-heading text-base font-semibold text-slate-900"
            >
              {SITE_NAME}
            </Link>
          </div>
          <StudentSidebar onNavigate={() => setMobileOpen(false)} />
        </MobileNav>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
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
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden md:block" />
            <div className="flex items-center gap-2">
              <NotificationBell href="/student/notifications" />
              <UserMenu profileHref="/student/profile" />
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>

          <div className="fixed bottom-4 right-4 z-30 md:hidden">
            <WhatsAppButton />
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}