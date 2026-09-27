"use client";

import { LeaderboardRow } from "./LeaderboardRow";
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
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {entries.map((e) => (
        <LeaderboardRow
          key={e.uid}
          entry={e}
          isCurrentUser={e.uid === currentUserId}
        />
      ))}
    </ul>
  );
}