"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Brand } from "@/components/layout/Brand";
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
    <div className="flex min-h-screen flex-col bg-[#e8ecf4] dark:bg-[#10131d] transition-colors duration-300 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-20 z-0 flex items-center justify-center">
        <div className="h-[40rem] w-[40rem] rounded-full bg-accent-500/15 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
        <Brand className="text-xl font-bold tracking-tight" />
        <ThemeToggle />
      </header>
      
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-md rounded-3xl neu-flat-lg p-8 sm:p-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
