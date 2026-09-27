"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SITE_NAME } from "@/lib/constants";

const AUTO_REDIRECT_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
]);

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, profile, authLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user || !profile) return;
    if (!AUTO_REDIRECT_PATHS.has(pathname)) return;
    if (!user.emailVerified) {
      router.replace("/verify-email");
      return;
    }
    router.replace(profile.role === "admin" ? "/admin" : "/student");
  }, [user, profile, authLoading, pathname, router]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="flex items-center justify-center py-8">
        <Link
          href="/"
          className="font-heading text-xl font-semibold text-slate-900"
        >
          {SITE_NAME}
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}