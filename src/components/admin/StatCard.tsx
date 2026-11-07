import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export interface StatCardProps {
  label: string;
  value: string | number | null;
  hint?: ReactNode;
  icon?: ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/70 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        {value === null ? (
          <Skeleton className="h-8 w-20 rounded-md" />
        ) : (
          <p className="font-heading text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100 sm:text-3xl">
            {value}
          </p>
        )}
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}