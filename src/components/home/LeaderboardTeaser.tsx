"use client";

import { motion } from "framer-motion";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { ordinal } from "@/lib/utils/format";
import { Trophy } from "lucide-react";

const TEASER_LIMIT = 3;

export function LeaderboardTeaser() {
  const { entries, loading, error } = useLeaderboard("alltime", TEASER_LIMIT);

  if (loading) {
    return (
      <section className="border-t border-slate-200/50 bg-slate-50 dark:border-slate-800/50 dark:bg-slate-950 transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <Skeleton className="mb-6 h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || entries.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-0 right-1/4 h-[40rem] w-[40rem] rounded-full bg-accent-600/20 blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 sm:py-28">
        <div className="mb-12 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="flex items-center gap-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              <Trophy className="h-8 w-8 text-yellow-400" />
              Top learners, all-time
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Consistency adds up. Here’s who’s leading right now.
            </p>
          </motion.div>
        </div>
        
        <ol className="grid gap-6 sm:grid-cols-3">
          {entries.map((e, idx) => (
            <motion.li
              key={e.uid}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: idx * 0.1 }}
              className="group flex items-center gap-5 rounded-2xl border border-slate-200/50 bg-white/50 p-5 backdrop-blur-md transition-all hover:bg-white hover:border-accent-500/50 hover:shadow-lg hover:shadow-accent-500/20 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-500 to-purple-500 opacity-0 blur transition duration-500 group-hover:opacity-50"></div>
                <Avatar name={e.name} size="lg" className="relative border-2 border-slate-200 dark:border-slate-700 group-hover:border-accent-500 transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{e.name}</p>
                <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <span className="text-yellow-400">{e.totalStars.toFixed(1)} stars</span>
                  <span>·</span>
                  <span className="text-accent-400">{ordinal(e.rank)} place</span>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
