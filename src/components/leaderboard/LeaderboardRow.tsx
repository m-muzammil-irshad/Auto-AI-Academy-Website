"use client";

import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils/cn";
import { pluralize } from "@/lib/utils/format";
import { RankLabel } from "./RankLabel";
import type { LeaderboardEntry } from "@/lib/types";

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}

export function LeaderboardRow({
  entry,
  isCurrentUser,
}: LeaderboardRowProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-4 px-4 py-3",
        isCurrentUser && "bg-accent-50/60"
      )}
    >
      <span className="w-10 shrink-0 text-right">
        <RankLabel rank={entry.rank} className="text-base" />
      </span>

      <Avatar name={entry.name} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">
          {entry.name}
          {isCurrentUser && (
            <span className="ml-2 rounded-full bg-accent-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              You
            </span>
          )}
        </p>
        <p className="text-xs text-slate-500">
          {entry.submissionCount}{" "}
          {pluralize(entry.submissionCount, "submission")}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-heading text-base font-semibold text-slate-900">
          {entry.totalStars.toFixed(1)}
        </p>
        <p className="text-xs text-slate-500">stars</p>
      </div>
    </li>
  );
}