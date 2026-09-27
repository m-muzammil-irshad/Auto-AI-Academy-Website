import { getDocs } from "firebase/firestore";
import { leaderboardCandidates } from "@/lib/firebase/queries";
import { monthKey } from "@/lib/utils/dates";
import type { AppUser, LeaderboardEntry } from "@/lib/types";

export type LeaderboardMode = "monthly" | "alltime";

interface Candidate {
  uid: string;
  name: string;
  totalStars: number;
  submissionCount: number;
}

/**
 * Fetch candidates with a single query (allTimeSubmissionCount > 0) and rank
 * client-side. This keeps the free tier simple — no composite indexes, no
 * per-month dynamic field paths.
 *
 * Scaling note: past roughly 1000 active users, switch to flat
 * `currentMonthStars` / `currentMonthKey` fields on the user doc so monthly
 * ranking can be done with a real Firestore orderBy + limit.
 */
export async function fetchLeaderboard(
  mode: LeaderboardMode,
  max?: number
): Promise<LeaderboardEntry[]> {
  const snap = await getDocs(leaderboardCandidates());
  const users: AppUser[] = snap.docs.map((d) => ({
    uid: d.id,
    ...(d.data() as Omit<AppUser, "uid">),
  }));

  const key = monthKey();
  const candidates: Candidate[] = users.map((u) => {
    if (mode === "monthly") {
      const m = u.monthlyStars?.[key];
      return {
        uid: u.uid,
        name: u.name,
        totalStars: m?.totalStars ?? 0,
        submissionCount: m?.submissionCount ?? 0,
      };
    }
    return {
      uid: u.uid,
      name: u.name,
      totalStars: u.allTimeStars ?? 0,
      submissionCount: u.allTimeSubmissionCount ?? 0,
    };
  });

  const ranked = candidates
    .filter((c) => c.submissionCount > 0)
    .sort((a, b) => {
      if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
      if (b.submissionCount !== a.submissionCount) {
        return b.submissionCount - a.submissionCount;
      }
      return a.name.localeCompare(b.name);
    })
    .map<LeaderboardEntry>((c, i) => ({ ...c, rank: i + 1 }));

  return typeof max === "number" ? ranked.slice(0, max) : ranked;
}