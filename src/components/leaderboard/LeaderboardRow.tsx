"use client";

import { Avatar } from "@/components/ui/Avatar";
import { motion } from "framer-motion";
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
    <motion.li
      variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
      className={cn(
        "flex items-center gap-4 px-4 py-3 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-2xl",
        isCurrentUser && "neu-pressed-sm"
      )}
    >
      <span className="w-10 shrink-0 text-right">
        <RankLabel rank={entry.rank} className="text-base" />
      </span>

      <Avatar name={entry.name} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {entry.name}
          {isCurrentUser && (
            <span className="ml-2 rounded-full neu-btn px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-600 dark:text-accent-400">
              You
            </span>
          )}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {entry.submissionCount}{" "}
          {pluralize(entry.submissionCount, "submission")}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <span className="neu-pressed-sm rounded-full px-3 py-1 font-heading text-sm font-bold text-accent-600 dark:text-accent-400 tabular-nums inline-block">
          {entry.totalStars.toFixed(1)} ★
        </span>
      </div>
    </motion.li>
  );
}