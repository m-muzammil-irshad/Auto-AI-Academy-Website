import { Badge } from "@/components/ui/Badge";
import { CRITERIA_MAX } from "@/lib/utils/stars";
import type { Grading } from "@/lib/types";

export interface GradingBreakdownProps {
  grading: Grading;
}

function CriterionRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white">
        {value.toFixed(1)} / {CRITERIA_MAX}
      </span>
    </div>
  );
}

export function GradingBreakdown({ grading }: GradingBreakdownProps) {
  return (
    <div className="rounded-xl border border-slate-200/50 bg-slate-50/60 p-4 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-heading text-sm font-semibold text-slate-800 dark:text-white">
          Your grade
        </p>
        <Badge variant="success">
          {grading.finalStars.toFixed(1)} ★
        </Badge>
      </div>
      <div className="space-y-2">
        <CriterionRow label="Correctness" value={grading.correctness} />
        <CriterionRow label="Creativity" value={grading.creativity} />
        <CriterionRow label="Timeliness" value={grading.timeliness} />
      </div>
    </div>
  );
}