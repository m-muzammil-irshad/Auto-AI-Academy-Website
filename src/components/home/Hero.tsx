"use client";

import Link from "next/link";
import Image from "next/image";
import heroIllustration from "../../../public/images/hero_illustration.webp";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { SITE_NAME } from "@/lib/constants";
import { EASE, fadeUp, stagger } from "@/lib/motion";

const STATS = [
  { value: "100%", label: "Free Courses", subtext: "Zero tuition, accessible to all" },
  { value: "24/7", label: "AI Mentor Guidance", subtext: "Immediate feedback on assignments" },
];

export function Hero() {
  return (
    <section id="home" className="relative bg-transparent transition-colors duration-200">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 sm:pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center">

          {/* Left Column: Text & Actions */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{SITE_NAME} Academy</span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span>Free tech education</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-heading text-4xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl max-w-2xl leading-[1.12]"
            >
              Practical programming and AI, taught completely free
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-base text-slate-600 dark:text-slate-400 sm:text-lg leading-relaxed"
            >
              Master Python, Artificial Intelligence, and modern automation in Urdu and Hindi. Watch step-by-step lessons, submit real coding exercises, get AI review, and earn verified certificates.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="rounded-lg px-6 py-3 text-sm font-medium shadow-sm">
                  Start learning
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="rounded-lg px-6 py-3 text-sm font-medium">
                  Browse courses
                </Button>
              </Link>
            </motion.div>

            {/* Quiet trust indicators */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> Urdu & Hindi lectures
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> Verified certificates
              </span>
            </motion.div>
          </motion.div>

          {/* Right Column: Hero Visual Frame */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-2 sm:p-3 shadow-sm">
              <div className="rounded-xl overflow-hidden relative aspect-square bg-slate-100 dark:bg-slate-950">
                <Image
                  src={heroIllustration}
                  alt="Student learning AI and Programming"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Structured Stats Row */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-20">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-slate-800">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className={`flex flex-col ${idx > 0 ? "pt-6 sm:pt-0 sm:pl-8" : ""}`}>
                <span className="font-heading text-3xl sm:text-4xl font-medium tabular-nums text-slate-900 dark:text-white">
                  <CountUp value={stat.value} />
                </span>
                <span className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-200">
                  {stat.label}
                </span>
                <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {stat.subtext}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
