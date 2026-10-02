"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import type { LeaderboardMode } from "@/lib/services/leaderboard";
import { Tabs } from "@/components/ui/Tabs";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const TABS = [
  { value: "monthly" as const, label: "Monthly" },
  { value: "alltime" as const, label: "All-Time" },
];

export default function StudentLeaderboardPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<LeaderboardMode>("monthly");
  const { entries, loading, error } = useLeaderboard(mode);

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-6"
      >
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
          Leaderboard
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Ranked by total stars earned from graded submissions.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="mb-6"
      >
        <Tabs value={mode} onChange={setMode} items={TABS} />
      </motion.div>

      {error && (
        <EmptyState title="Could not load leaderboard" description={error} />
      )}

      {loading ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="space-y-2 rounded-2xl border border-slate-200/50 bg-white/50 backdrop-blur-md p-2 dark:border-slate-800/50 dark:bg-slate-900/50"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </motion.div>
      ) : entries.length === 0 ? (
        <EmptyState
          title={
            mode === "monthly"
              ? "No stars this month yet"
              : "Leaderboard is empty — be the first to submit!"
          }
          description={
            mode === "monthly"
              ? "Submit an assignment and get graded to appear here."
              : "Once students get graded, they’ll show up here."
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1 }}
        >
          <LeaderboardTable entries={entries} currentUserId={user?.uid} />
        </motion.div>
      )}
    </div>
  );
}

