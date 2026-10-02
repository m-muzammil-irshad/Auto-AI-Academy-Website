"use client";

import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SITE_NAME } from "@/lib/constants";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20 z-0 flex items-center justify-center">
        <div className="h-[40rem] w-[40rem] rounded-full bg-accent-500/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
        <Link
          href="/"
          className="font-heading text-xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          {SITE_NAME}
        </Link>
        <ThemeToggle />
      </header>
      
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-3xl border border-slate-200/50 bg-white/60 p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/60 sm:p-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
