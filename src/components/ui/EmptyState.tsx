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
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center",
        className
      )}
    >
      <h3 className="mb-1 text-base font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action}
    </div>
  );
}