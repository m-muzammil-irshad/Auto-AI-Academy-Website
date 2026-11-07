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
    <div className="neu-flat-interactive relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 transition-all duration-300">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {icon && (
          <div className="neu-pressed flex h-10 w-10 items-center justify-center rounded-2xl transition-transform hover:scale-105">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4">
        {value === null ? (
          <Skeleton className="h-9 w-20 rounded-xl" />
        ) : (
          <p className="font-heading text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            {value}
          </p>
        )}
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}