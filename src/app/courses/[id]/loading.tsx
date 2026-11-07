"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#e8ecf4] dark:bg-[#10131d] transition-colors duration-300">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-10 w-10 text-accent-500" />
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading course details...</p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
