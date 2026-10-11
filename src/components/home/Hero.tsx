"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { SITE_NAME } from "@/lib/constants";
import { DURATION, EASE, fadeUp, stagger } from "@/lib/motion";

const STATS = [
  { value: "100%", label: "Free Courses" },
  { value: "24/7", label: "AI Support" },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-transparent transition-colors duration-300">
      {/* Single soft glow behind the headline */}
      <div className="pointer-events-none absolute left-[-10rem] top-[-10rem] z-0 h-[36rem] w-[36rem] rounded-full bg-accent-500/15 blur-[120px] dark:bg-accent-500/10" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left Text Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left"
          >
            <motion.p
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-800 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-slate-200 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
              </span>
              {SITE_NAME} Training Program
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-heading text-5xl font-bold leading-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl max-w-2xl"
            >
              Learn modern tech{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">
                completely free.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-lg text-lg text-slate-600 dark:text-slate-300 md:text-xl leading-relaxed"
            >
              Free AI, programming, and automation courses in Urdu/Hindi for learners across Pakistan and India. Watch tutorials, submit assignments, get AI feedback, and earn certificates.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30">
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="rounded-full px-8 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-white">
                  Explore Courses
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image/Illustration Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <div className="group relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200/50 bg-white/20 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/20">
              <Image
                src="/images/hero_illustration.jpg"
                alt="Student learning AI and Programming"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                priority
              />
            </div>
            {/* Floating badge: a slow drift instead of a bounce */}
            <div className="absolute -bottom-6 -left-6 hidden animate-float rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-md dark:bg-slate-800/80 sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">100% Free</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quality Education</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 border-y border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.reveal, delay: 0.4 }}
            className="mx-auto grid max-w-2xl grid-cols-2 gap-8 divide-x divide-slate-200/50 dark:divide-slate-800/50"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center text-center px-4">
                <span className="font-heading text-3xl sm:text-4xl font-bold tabular-nums text-accent-600 dark:text-accent-400">
                  <CountUp value={stat.value} />
                </span>
                <span className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
