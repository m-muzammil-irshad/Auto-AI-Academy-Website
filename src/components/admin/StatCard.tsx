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
    <Card>
      <CardBody>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        {value === null ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p className="mt-1 font-heading text-3xl font-semibold text-slate-900">
            {value}
          </p>
        )}
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </CardBody>
    </Card>
  );
}