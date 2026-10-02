import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-6 py-12 text-center transition-colors",
        className
      )}
    >
      <h3 className="mb-1 text-base font-semibold text-slate-800 dark:text-white">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action}
    </div>
  );
}