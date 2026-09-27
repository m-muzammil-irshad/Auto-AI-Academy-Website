"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ordinal } from "@/lib/utils/format";

const TEASER_LIMIT = 3;

export function LeaderboardTeaser() {
  const { entries, loading, error } = useLeaderboard("alltime", TEASER_LIMIT);

  if (loading) {
    return (
      <section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <Skeleton className="mb-6 h-7 w-56 bg-slate-700" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 bg-slate-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Section hides itself entirely when there's nothing to show — no empty container.
  if (error || entries.length === 0) return null;

  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-8 max-w-2xl">
          <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
            Top learners, all-time
          </h2>
          <p className="mt-2 text-slate-300">
            Consistency adds up. Here’s who’s leading right now.
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          {entries.map((e) => (
            <li
              key={e.uid}
              className="flex items-center gap-4 rounded-lg bg-slate-800 p-4"
            >
              <Avatar name={e.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-medium">{e.name}</p>
                <p className="text-sm text-slate-400">
                  {e.totalStars.toFixed(1)} stars · {ordinal(e.rank)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}