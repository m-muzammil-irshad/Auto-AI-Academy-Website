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
    text: "Follow a step-by-step path from total beginner to job-ready builder. No jumping between random disconnected videos.",
    icon: <Layout className="h-6 w-6" />,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    title: "Human + AI Feedback",
    text: "Assignments reviewed on logic, creativity, and speed. Get code critique that helps you grow rapidly.",
    icon: <CheckCircle className="h-6 w-6" />,
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    title: "Competitive Leaderboard",
    text: "Earn stars for every assignment submitted. Rank up globally across Pakistan & India and prove your consistency.",
    icon: <Trophy className="h-6 w-6" />,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    title: "Verified Certificates",
    text: "Complete 80% of practical assignments to claim your personalized, QR-verified certificate to share on LinkedIn.",
    icon: <Award className="h-6 w-6" />,
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
          <div className="mb-4 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            <span>Platform Advantages</span>
          </div>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Why learners <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">stay with us</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            We provide a proven, interactive environment engineered to help you actually complete what you start.
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
              <div className="neu-flat-interactive relative h-full overflow-hidden rounded-3xl p-8 flex flex-col justify-between">
                {/* Accent line that fills on hover */}
                <div className={`absolute top-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r ${v.gradient} transition-transform duration-300 ease-smooth group-hover:scale-x-100`} />

                <div>
                  {/* Neumorphic recessed icon well */}
                  <div className="neu-pressed rounded-2xl h-16 w-16 p-3 flex items-center justify-center mb-6">
                    <div className={`h-full w-full rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center text-white shadow-md shadow-black/10`}>
                      {v.icon}
                    </div>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {v.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-400">
                    {v.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

