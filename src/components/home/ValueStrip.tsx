"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Layout, CheckCircle, Trophy, Award } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

interface ValueItem {
  title: string;
  text: string;
  icon: ReactNode;
  gradient: string;
}

const VALUES: ValueItem[] = [
  {
    title: "Structured Curriculum",
    text: "Follow a clear path from beginner to expert. No more jumping between random videos.",
    icon: <Layout className="h-7 w-7" />,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Human + AI Feedback",
    text: "Assignments graded on correctness, creativity, and timeliness to ensure true mastery.",
    icon: <CheckCircle className="h-7 w-7" />,
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    title: "Competitive Leaderboard",
    text: "Earn stars for every assignment. Rank up globally and showcase your dedication.",
    icon: <Trophy className="h-7 w-7" />,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    title: "Verified Certificates",
    text: "Finish 80% of assignments to instantly claim your personalized, shareable certificate.",
    icon: <Award className="h-7 w-7" />,
    gradient: "from-purple-500 to-pink-500",
  },
];

export function ValueStrip() {
  return (
    <section id="why" className="relative bg-transparent transition-colors duration-300 py-24 sm:py-32 overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <span className="mb-4 inline-block font-heading text-sm font-bold tracking-widest text-accent-600 dark:text-accent-400 uppercase">
            Platform Benefits
          </span>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Why learners stay with us
          </h2>
          <p className="mt-6 text-xl text-slate-600 dark:text-slate-400">
            We provide an environment designed to help you actually finish what you start.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {VALUES.map((v) => (
            <motion.div key={v.title} variants={fadeUp} className="group">
              <div className="card-surface card-hover relative h-full overflow-hidden bg-white/80 p-8 dark:bg-slate-900/80">
                {/* Accent line that fills on hover */}
                <div className={`absolute top-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r ${v.gradient} transition-transform duration-300 ease-smooth group-hover:scale-x-100`} />

                <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${v.gradient} text-white shadow-lg`}>
                  {v.icon}
                </div>
                <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {v.title}
                </h3>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
                  {v.text}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
