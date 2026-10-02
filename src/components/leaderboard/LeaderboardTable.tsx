"use client";

import { LeaderboardRow } from "./LeaderboardRow";
import { motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types";

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

export function LeaderboardTable({
  entries,
  currentUserId,
}: LeaderboardTableProps) {
  return (
    <motion.ul 
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      className="divide-y divide-slate-100/50 dark:divide-slate-800/50 rounded-2xl border border-slate-200/50 bg-white/50 dark:bg-slate-900/50 dark:border-slate-800/50 backdrop-blur-md"
    >
      {entries.map((e) => (
        <LeaderboardRow
          key={e.uid}
          entry={e}
          isCurrentUser={e.uid === currentUserId}
        />
      ))}
    </motion.ul>
  );
}
