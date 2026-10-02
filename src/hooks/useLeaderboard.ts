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

const cachedLeaderboard: Record<string, { data: LeaderboardEntry[]; time: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useLeaderboard(
  mode: LeaderboardMode,
  max?: number
): UseLeaderboardResult {
  const key = `${mode}-${max || "all"}`;
  
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => 
    cachedLeaderboard[key] ? cachedLeaderboard[key].data : []
  );
  const [loading, setLoading] = useState(() => !cachedLeaderboard[key]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    
    const cached = cachedLeaderboard[key];
    if (cached && Date.now() - cached.time < CACHE_DURATION) {
      setEntries(cached.data);
      setLoading(false);
      // Fetch in background
      fetchLeaderboard(mode, max).then((list) => {
        if (!cancelled) {
          cachedLeaderboard[key] = { data: list, time: Date.now() };
          setEntries(list);
        }
      }).catch(console.error);
      return;
    }

    setLoading(true);
    setError("");
    
    fetchLeaderboard(mode, max)
      .then((list) => {
        if (!cancelled) {
          cachedLeaderboard[key] = { data: list, time: Date.now() };
          setEntries(list);
        }
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
  }, [mode, max, key]);

  return { entries, loading, error };
}