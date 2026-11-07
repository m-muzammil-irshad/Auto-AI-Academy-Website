"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Brand } from "@/components/layout/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";

const AUTO_REDIRECT_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
]);

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, profile, authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#090c15] text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <header className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
        <Brand className="text-lg font-medium" />
        <ThemeToggle />
      </header>
      
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-md rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
