"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Trophy, Award } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const VALUES = [
  {
    title: "Structured curriculum",
    text: "Follow a step-by-step path from fundamentals to production code. No disconnected or abandoned tutorials.",
    icon: BookOpen,
  },
  {
    title: "Human and AI feedback",
    text: "Every assignment is reviewed on code structure and correctness, giving you actionable steps to improve.",
    icon: CheckCircle,
  },
  {
    title: "Peer leaderboard",
    text: "Earn stars for verified assignment submissions. Track your consistency alongside students across South Asia.",
    icon: Trophy,
  },
  {
    title: "Verified certificates",
    text: "Complete 80% of practical assignments to unlock your public, QR-verified certificate to share on LinkedIn.",
    icon: Award,
  },
];

export function ValueStrip() {
  return (
    <section id="why" className="relative bg-transparent transition-colors duration-200 py-20 sm:py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-14 text-center max-w-2xl mx-auto"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
            <span>Platform methodology</span>
          </div>
          <h2 className="font-heading text-3xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built to help you finish what you start
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Free online tutorials have a 95% drop-off rate. We combine structured video lessons with mandatory coding assignments so you actually build skills.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {VALUES.map((v) => {
            const IconComponent = v.icon;
            return (
              <motion.div key={v.title} variants={fadeUp}>
                <div className="h-full rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-6 flex flex-col justify-between transition-colors hover:border-slate-300 dark:hover:border-slate-700">
                  <div>
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 mb-5">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading text-lg font-medium text-slate-900 dark:text-white mb-2">
                      {v.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {v.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
