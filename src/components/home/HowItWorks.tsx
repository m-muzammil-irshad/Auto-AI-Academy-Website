"use client";

import { motion } from "framer-motion";
import { PlayCircle, UploadCloud, Trophy, MousePointerClick } from "lucide-react";
import { EASE, fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    n: 1,
    title: "Enroll in a Click",
    text: "Pick your desired course and join instantly without any complicated process.",
    icon: MousePointerClick,
    color: "from-blue-500 to-cyan-400",
  },
  {
    n: 2,
    title: "Learn & Practice",
    text: "Watch premium tutorials on our official channels and start practicing.",
    icon: PlayCircle,
    color: "from-purple-500 to-pink-500",
  },
  {
    n: 3,
    title: "Submit Work",
    text: "Turn in assignments via simple Drive links for fast grading.",
    icon: UploadCloud,
    color: "from-accent-500 to-indigo-500",
  },
  {
    n: 4,
    title: "Rank & Certify",
    text: "Climb the global leaderboard and earn a verified certificate.",
    icon: Trophy,
    color: "from-orange-400 to-red-500",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-transparent py-24 sm:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-20 text-center max-w-3xl mx-auto"
        >
          <span className="mb-4 inline-block font-heading text-sm font-bold tracking-widest text-accent-600 dark:text-accent-400 uppercase">
            Your Journey
          </span>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Four steps to mastery.
          </h2>
          <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            We’ve removed all the friction. Go from your first lecture to earning your certificate seamlessly.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative"
        >
          {/* Connecting line (desktop) draws from the first step to the last */}
          <motion.div
            variants={{
              hidden: { scaleX: 0 },
              show: { scaleX: 1, transition: { duration: 1, ease: EASE } },
            }}
            className="hidden lg:block absolute top-1/2 left-0 w-full h-1 origin-left bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-orange-500/30 -translate-y-1/2 rounded-full z-0"
          />

          {STEPS.map((s) => (
            <motion.div key={s.n} variants={fadeUp} className="relative z-10 group">
              <div className="card-surface card-hover relative h-full overflow-hidden bg-white/80 p-8 dark:bg-slate-900/80">
                {/* Large Background Number */}
                <div className="absolute -right-4 -top-8 text-[150px] font-black text-slate-900/5 dark:text-slate-700/20 pointer-events-none select-none font-heading">
                  {s.n}
                </div>

                <div className="relative z-10">
                  <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                    <s.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {s.title}
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    {s.text}
                  </p>
                </div>

                {/* Accent line that fills on hover */}
                <div className={`absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r ${s.color} transition-transform duration-300 ease-smooth group-hover:scale-x-100`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
