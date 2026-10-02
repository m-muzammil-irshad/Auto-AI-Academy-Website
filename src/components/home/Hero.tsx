"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SITE_NAME } from "@/lib/constants";

const STATS = [
  { value: "10,000+", label: "Enrolled Trainees" },
  { value: "100%", label: "Free Courses" },
  { value: "24/7", label: "AI Support" },
  { value: "500+", label: "Certificates Awarded" },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-transparent transition-colors duration-300">
      {/* Background glowing blobs for Glassmorphism effect */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 pointer-events-none opacity-60 dark:opacity-40 z-0">
        <div className="absolute top-[-10rem] left-0 h-[40rem] w-[40rem] rounded-full bg-accent-500/20 dark:bg-accent-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[5rem] right-0 h-[30rem] w-[30rem] rounded-full bg-purple-500/20 dark:bg-purple-600/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 sm:pt-32 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-800 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50 dark:text-slate-200 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                </span>
                {SITE_NAME} Training Program
              </p>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="font-heading text-5xl font-bold leading-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl max-w-2xl"
            >
              Learn modern tech{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">
                completely free.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="mt-6 max-w-lg text-lg text-slate-600 dark:text-slate-300 md:text-xl leading-relaxed"
            >
              Join Pakistan&apos;s premier platform for AI, programming, and automation. Watch tutorials, submit assignments, get AI feedback, and earn certificates.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-accent-500/25 transition-all duration-500 ease-out hover:shadow-xl hover:shadow-accent-500/40 hover:-translate-y-1">
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="rounded-full px-8 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-white transition-all duration-500 ease-out hover:-translate-y-1">
                  Explore Courses
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Image/Illustration Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-slate-700/50 bg-white/20 dark:bg-slate-800/20 shadow-2xl backdrop-blur-xl group">
              <Image 
                src="/images/hero_illustration.jpg" 
                alt="Student learning AI and Programming" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              {/* Decorative floating badge */}
              <div className="absolute -bottom-6 -left-6 rounded-2xl border border-white/20 bg-white/80 dark:bg-slate-800/80 p-4 shadow-xl backdrop-blur-md hidden sm:block animate-bounce" style={{ animationDuration: '3s' }}>
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
            </div>
          </motion.div>

        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 border-y border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200/50 dark:divide-slate-800/50">
            {STATS.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + (idx * 0.1) }}
                className="flex flex-col items-center justify-center text-center px-4"
              >
                <span className="font-heading text-3xl sm:text-4xl font-bold text-accent-600 dark:text-accent-400">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
