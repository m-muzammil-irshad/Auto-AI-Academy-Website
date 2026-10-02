import { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export interface StatCardProps {
  label: string;
  value: string | number | null;
  hint?: ReactNode;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <Card className="transition-all hover:-translate-y-1 hover:shadow-md dark:hover:shadow-accent-500/5">
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        {value === null ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p className="mt-1 font-heading text-3xl font-semibold text-slate-900 dark:text-white">
            {value}
          </p>
        )}
        {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </CardBody>
    </Card>
  );
}