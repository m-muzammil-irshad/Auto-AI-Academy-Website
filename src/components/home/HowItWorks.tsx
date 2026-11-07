"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle, UploadCloud, Trophy, MousePointerClick, ArrowRight } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    title: "Enroll in a course",
    text: "Select any active course in the catalog and begin immediately with zero registration fee.",
    icon: MousePointerClick,
  },
  {
    n: "02",
    title: "Watch and practice",
    text: "Follow step-by-step Urdu/Hindi video lectures and code along in your local development environment.",
    icon: PlayCircle,
  },
  {
    n: "03",
    title: "Submit assignments",
    text: "Turn in your code repositories or links. Get instant AI critique and instructor review.",
    icon: UploadCloud,
  },
  {
    n: "04",
    title: "Earn certificates",
    text: "Reach 80% assignment completion to claim a public, verified credential to showcase your skills.",
    icon: Trophy,
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-transparent py-20 sm:py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14 text-center max-w-2xl mx-auto"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
            <span>Learning process</span>
          </div>
          <h2 className="font-heading text-3xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            From first lesson to verified completion
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            A clear four-stage path designed to keep you motivated and building real projects from day one.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((s) => {
            const IconComponent = s.icon;
            return (
              <motion.div key={s.n} variants={fadeUp}>
                <Link
                  href={`/how-it-works#step-${s.n}`}
                  className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                >
                  <div className="h-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <span className="font-mono text-xs font-medium text-slate-400 dark:text-slate-500">
                          {s.n}
                        </span>
                      </div>

                      <h3 className="font-heading text-lg font-medium text-slate-900 dark:text-white mb-2">
                        {s.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {s.text}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      <span>View details</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
