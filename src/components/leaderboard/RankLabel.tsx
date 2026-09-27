import { cn } from "@/lib/utils/cn";

export interface RankLabelProps {
  rank: number;
  className?: string;
}

/**
 * Top 10 → ordinal with superscript suffix ("1st", "2nd", "3rd"…).
 * Rank 11+ → plain "#11".
 */
export function RankLabel({ rank, className }: RankLabelProps) {
  const isTopTen = rank >= 1 && rank <= 10;

  if (!isTopTen) {
    return (
      <span className={cn("font-medium tabular-nums text-slate-600", className)}>
        #{rank}
      </span>
    );
  }

  const suffix =
    rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";

  return (
    <span className={cn("font-heading text-slate-900", className)}>
      {rank}
      <sup className="ml-0.5 text-[0.65em] font-semibold uppercase tracking-wider text-accent-600">
        {suffix}
      </sup>
    </span>
  );
}