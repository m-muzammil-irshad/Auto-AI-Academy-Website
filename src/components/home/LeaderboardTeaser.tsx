"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Star, ArrowRight } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const TEASER_LIMIT = 3;

export function LeaderboardTeaser() {
  const { entries, loading, error } = useLeaderboard("alltime", TEASER_LIMIT);

  if (loading) {
    return (
      <section className="bg-transparent transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <Skeleton className="mb-6 h-8 w-60 rounded-lg" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-5 h-24" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) return null;

  if (entries.length === 0) {
    return (
      <section className="relative bg-transparent transition-colors duration-200 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 sm:p-12 text-center"
          >
            <h2 className="font-heading text-2xl font-medium text-slate-900 dark:text-white">
              Student leaderboard
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Submit your first coding assignment to earn stars and rank on the public leaderboard.
            </p>
            <Link href="/signup" className="mt-6 inline-block">
              <Button size="md" className="rounded-lg px-5 py-2.5 text-sm font-medium">
                Create free account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-transparent transition-colors duration-200 py-16 sm:py-20">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
              <span>Student rankings</span>
            </div>
            <h2 className="font-heading text-3xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Top learners, all-time
            </h2>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
              Consistency and problem-solving rewarded. Students with the highest verified assignment stars.
            </p>
          </div>
          <Link href="/student/leaderboard" className="shrink-0">
            <Button variant="secondary" size="md" className="rounded-lg px-4 py-2 text-sm font-medium">
              View full ranking
            </Button>
          </Link>
        </motion.div>

        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-6 sm:grid-cols-3"
        >
          {entries.map((e) => (
            <motion.li key={e.uid} variants={fadeUp}>
              <div className="relative flex items-center gap-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                <Avatar name={e.name} size="md" className="rounded-lg shrink-0" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {e.name}
                    </p>
                    <span className="font-mono text-xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
                      #{e.rank}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 font-mono tabular-nums text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {e.totalStars}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">
                      {e.submissionCount} {e.submissionCount === 1 ? "task" : "tasks"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
