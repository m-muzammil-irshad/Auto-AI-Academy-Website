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
const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

function getInitialLeaderboard(key: string): LeaderboardEntry[] {
  if (cachedLeaderboard[key]) return cachedLeaderboard[key].data;
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`aaa_leaderboard_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        cachedLeaderboard[key] = { data: parsed, time: Date.now() };
        return parsed;
      }
    } catch {
      // ignore
    }
  }
  return [];
}

export function useLeaderboard(
  mode: LeaderboardMode,
  max?: number
): UseLeaderboardResult {
  const key = `${mode}-${max || "all"}`;
  
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => 
    getInitialLeaderboard(key)
  );
  const [loading, setLoading] = useState(() => getInitialLeaderboard(key).length === 0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    const cached = cachedLeaderboard[key];

    if (cached && now - cached.time < CACHE_DURATION) {
      setEntries(cached.data);
      setLoading(false);
      if (now - cached.time < 1000 * 60 * 2) {
        return; // completely fresh
      }
    }

    if (entries.length === 0) {
      setLoading(true);
    }
    setError("");
    
    fetchLeaderboard(mode, max)
      .then((list) => {
        if (!cancelled) {
          cachedLeaderboard[key] = { data: list, time: Date.now() };
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(`aaa_leaderboard_${key}`, JSON.stringify(list));
            } catch {
              // ignore
            }
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, max, key]);

  return { entries, loading, error };
}