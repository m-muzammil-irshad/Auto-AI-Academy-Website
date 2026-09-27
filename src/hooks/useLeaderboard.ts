"use client";

import { useEffect, useState } from "react";
import {
  fetchLeaderboard,
  type LeaderboardMode,
} from "@/lib/services/leaderboard";
import type { LeaderboardEntry } from "@/lib/types";

export interface UseLeaderboardResult {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string;
}

export function useLeaderboard(
  mode: LeaderboardMode,
  max?: number
): UseLeaderboardResult {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchLeaderboard(mode, max)
      .then((list) => {
        if (!cancelled) setEntries(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load leaderboard."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, max]);

  return { entries, loading, error };
}