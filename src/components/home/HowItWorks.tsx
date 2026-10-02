"use client";

import { motion, Variants } from "framer-motion";
import { PlayCircle, UploadCloud, Trophy, MousePointerClick } from "lucide-react";

const STEPS = [
  {
    n: 1,
    title: "Enroll in a Click",
    text: "Pick your desired course and join instantly without any complicated process.",
    icon: MousePointerClick,
    color: "from-blue-500 to-cyan-400",
    shadow: "shadow-blue-500/20",
  },
  {
    n: 2,
    title: "Learn & Practice",
    text: "Watch premium tutorials on our official channels and start practicing.",
    icon: PlayCircle,
    color: "from-purple-500 to-pink-500",
    shadow: "shadow-purple-500/20",
  },
  {
    n: 3,
    title: "Submit Work",
    text: "Turn in assignments via simple Drive links for fast grading.",
    icon: UploadCloud,
    color: "from-accent-500 to-indigo-500",
    shadow: "shadow-accent-500/20",
  },
  {
    n: 4,
    title: "Rank & Certify",
    text: "Climb the global leaderboard and earn a verified certificate.",
    icon: Trophy,
    color: "from-orange-400 to-red-500",
    shadow: "shadow-orange-500/20",
  },
] as const;

const containerVariants = {
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

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-transparent py-24 sm:py-32">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 h-[50rem] w-[50rem] rounded-full bg-accent-600/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-0 right-0 h-[40rem] w-[40rem] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
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
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative"
        >
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20 -translate-y-1/2 rounded-full z-0" />

          {STEPS.map((s, idx) => (
            <motion.div
              key={s.n}
              variants={itemVariants}
              className="relative z-10 group"
            >
              <div className={`relative h-full rounded-3xl border border-slate-200/50 bg-white/80 dark:border-slate-700/50 dark:bg-slate-800/80 p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-4 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-2xl hover:${s.shadow} overflow-hidden`}>
                
                {/* Large Background Number */}
                <div className="absolute -right-4 -top-8 text-[150px] font-black text-slate-900/5 dark:text-slate-700/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none select-none font-heading">
                  {s.n}
                </div>

                <div className="relative z-10">
                  <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                    <s.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {s.title}
                  </h3>
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed group-hover:text-slate-800 dark:group-hover:text-slate-300 transition-colors">
                    {s.text}
                  </p>
                </div>

                {/* Bottom Glowing Border Effect */}
                <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${s.color} transition-all duration-500 group-hover:w-full`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
