"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ordinal } from "@/lib/utils/format";
import { Trophy } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const TEASER_LIMIT = 3;

export function LeaderboardTeaser() {
  const { entries, loading, error } = useLeaderboard("alltime", TEASER_LIMIT);

  if (loading) {
    return (
      <section className="bg-transparent transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <Skeleton className="mb-6 h-10 w-72 rounded-lg" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) return null;

  if (entries.length === 0) {
    return (
      <section className="relative bg-transparent transition-colors duration-300">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:py-28">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="card-surface flex flex-col items-center bg-white/80 p-10 text-center dark:bg-slate-900/80"
          >
            <Trophy className="h-10 w-10 text-yellow-400" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              The leaderboard is wide open
            </h2>
            <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
              Nobody has claimed the top spot yet. Submit your first assignment, earn stars, and put your name here.
            </p>
            <Link href="/signup" className="mt-6">
              <Button className="rounded-full px-6">Be the first</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12 max-w-2xl"
        >
          <h2 className="flex items-center gap-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            <Trophy className="h-8 w-8 text-yellow-400" />
            Top learners, all-time
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Consistency adds up. Here’s who’s leading right now.
          </p>
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
              <div className="card-surface card-hover flex items-center gap-5 p-5">
                <Avatar name={e.name} size="lg" className="border-2 border-slate-200 dark:border-slate-700" />
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-slate-800 dark:text-slate-100">{e.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-yellow-500 dark:text-yellow-400">{e.totalStars.toFixed(1)} stars</span>
                    <span>·</span>
                    <span className="text-accent-600 dark:text-accent-400">{ordinal(e.rank)} place</span>
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
