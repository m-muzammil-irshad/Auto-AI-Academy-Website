"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle, UploadCloud, Trophy, MousePointerClick, ArrowRight } from "lucide-react";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    n: 1,
    stepTag: "Step 01",
    title: "Enroll in a Click",
    text: "Pick your desired course and join instantly without any complicated or paywalled process.",
    icon: MousePointerClick,
    color: "from-blue-500 to-cyan-400",
  },
  {
    n: 2,
    stepTag: "Step 02",
    title: "Learn & Practice",
    text: "Watch step-by-step Urdu/Hindi tutorials and follow along with structured code exercises.",
    icon: PlayCircle,
    color: "from-purple-500 to-pink-500",
  },
  {
    n: 3,
    stepTag: "Step 03",
    title: "Submit Assignments",
    text: "Turn in assignments via simple cloud links and receive detailed feedback from AI & mentors.",
    icon: UploadCloud,
    color: "from-accent-500 to-indigo-500",
  },
  {
    n: 4,
    stepTag: "Step 04",
    title: "Rank & Certify",
    text: "Climb the global student leaderboard and unlock your accredited, shareable certificate.",
    icon: Trophy,
    color: "from-amber-400 to-orange-500",
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
          <div className="mb-4 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            <span>Your Learning Path</span>
          </div>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Four steps to <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">mastery.</span>
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
            Zero friction, zero fees. Go from your very first lesson to earning your verified certificate with full mentorship.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative"
        >
          {STEPS.map((s) => (
            <motion.div key={s.n} variants={fadeUp} className="relative z-10 group">
              <Link
                href={`/how-it-works#step-${s.n}`}
                className="block h-full rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                aria-label={`${s.title} - Learn more about Step ${s.n}`}
              >
                <div className="neu-flat-interactive relative h-full overflow-hidden rounded-3xl p-8 flex flex-col justify-between cursor-pointer">
                  {/* Embossed Watermark Number */}
                  <div className="absolute -right-3 -top-6 text-[130px] font-black select-none pointer-events-none font-heading text-slate-400/20 dark:text-slate-700/20 transition-transform duration-500 group-hover:scale-105">
                    {s.n}
                  </div>

                  <div className="relative z-10">
                    {/* Neumorphic Recessed Icon Nest */}
                    <div className="neu-pressed rounded-2xl h-16 w-16 p-3 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105">
                      <div className={`h-full w-full rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-md shadow-black/10`}>
                        <s.icon className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="neu-pressed-sm rounded-full px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 w-fit mb-3">
                      {s.stepTag}
                    </div>

                    <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                      {s.text}
                    </p>
                  </div>

                  {/* Bottom tactile accent bar */}
                  <div className="relative z-10 mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-accent-600 dark:text-accent-400">
                    <span className="group-hover:underline">Learn more</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5" />
                  </div>

                  {/* Subtle top edge glow on hover */}
                  <div className={`absolute top-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r ${s.color} transition-transform duration-300 ease-smooth group-hover:scale-x-100`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

