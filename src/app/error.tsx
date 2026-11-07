"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md neu-flat rounded-3xl p-10 text-center">
        <div className="neu-pressed-sm rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 w-fit mx-auto mb-4">
          Error
        </div>
        <h1 className="mb-3 font-heading text-3xl font-extrabold text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="mb-8 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <Button size="lg" onClick={reset} className="neu-btn-primary rounded-full px-8 py-3.5 font-bold">
          Try again
        </Button>
      </div>
    </div>
  );
}