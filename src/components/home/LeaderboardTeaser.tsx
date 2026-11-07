"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ordinal } from "@/lib/utils/format";
import { Trophy, Star, ArrowRight } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const TEASER_LIMIT = 3;

export function LeaderboardTeaser() {
  const { entries, loading, error } = useLeaderboard("alltime", TEASER_LIMIT);

  if (loading) {
    return (
      <section className="bg-transparent transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <Skeleton className="mb-6 h-10 w-72 rounded-2xl" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="neu-flat rounded-3xl p-6 h-28" />
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
            className="neu-flat rounded-3xl flex flex-col items-center p-10 sm:p-14 text-center"
          >
            <div className="neu-pressed rounded-2xl h-16 w-16 flex items-center justify-center text-amber-500 mb-4">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="mt-2 font-heading text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
              The leaderboard is wide open
            </h2>
            <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
              Nobody has claimed the top spot yet. Submit your first assignment, earn stars, and put your name here.
            </p>
            <Link href="/signup" className="mt-8">
              <Button size="lg" className="neu-btn-primary rounded-full px-8 py-3.5 font-bold">
                Be the first
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-transparent text-slate-900 dark:text-white transition-colors duration-300 py-16 sm:py-24">
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div>
            <div className="mb-3 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Hall of Fame</span>
            </div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
              Top learners, all-time
            </h2>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
              Consistency and hard work add up. Here’s who’s leading the community right now.
            </p>
          </div>
          <Link href="/student/leaderboard" className="shrink-0">
            <Button variant="secondary" size="md" className="neu-btn rounded-full px-6 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
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
          {entries.map((e, index) => (
            <motion.li key={e.uid} variants={fadeUp}>
              <div className="neu-flat-interactive relative flex items-center gap-4 rounded-3xl p-6 overflow-hidden group">
                {/* Large watermark number */}
                <div className="absolute right-3 -bottom-5 text-7xl font-black select-none pointer-events-none font-heading text-slate-400/15 dark:text-slate-700/20">
                  #{e.rank}
                </div>

                {/* Recessed Avatar Cradle */}
                <div className="neu-pressed rounded-full p-1 shrink-0">
                  <Avatar name={e.name} size="lg" className="border-none" />
                </div>

                <div className="min-w-0 relative z-10 flex-1">
                  <p className="truncate text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {e.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="neu-pressed-sm rounded-full px-2.5 py-0.5 text-xs font-bold text-amber-500 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-500" />
                      {e.totalStars.toFixed(1)}
                    </span>
                    <span className="neu-pressed-sm rounded-full px-2.5 py-0.5 text-xs font-semibold text-accent-600 dark:text-accent-400">
                      {ordinal(e.rank)}
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

