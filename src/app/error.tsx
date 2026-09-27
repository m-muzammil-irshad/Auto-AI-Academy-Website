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
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Something went wrong</h1>
      <p className="mb-6 text-slate-600">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}