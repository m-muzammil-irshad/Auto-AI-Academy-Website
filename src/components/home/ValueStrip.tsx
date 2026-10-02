"use client";

import type { ReactNode } from "react";
import { motion, Variants } from "framer-motion";
import { Layout, CheckCircle, Trophy, Award } from "lucide-react";

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

export function ValueStrip() {
  return (
    <section id="why" className="relative bg-transparent transition-colors duration-300 py-24 sm:py-32 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 h-[40rem] w-[40rem] rounded-full bg-accent-500/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-[40rem] w-[40rem] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
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
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {VALUES.map((v) => (
            <motion.div
              key={v.title}
              variants={itemVariants}
              className="group relative rounded-[2rem] border border-slate-200/60 bg-slate-50/80 p-8 backdrop-blur-md transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-accent-500/10 dark:border-slate-800/60 dark:bg-slate-900/80 dark:hover:bg-slate-900 dark:hover:shadow-accent-400/10 hover:-translate-y-2 overflow-hidden"
            >
              {/* Top Gradient Bar */}
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${v.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              
              <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${v.gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                {v.icon}
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {v.title}
              </h3>
              <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                {v.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
