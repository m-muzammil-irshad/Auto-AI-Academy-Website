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
        "flex flex-col items-center justify-center rounded-3xl neu-pressed p-8 sm:p-12 text-center transition-all",
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