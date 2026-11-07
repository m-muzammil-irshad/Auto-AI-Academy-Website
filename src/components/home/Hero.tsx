"use client";

import Link from "next/link";
import Image from "next/image";
import heroIllustration from "../../../public/images/hero_illustration.webp";
import { motion } from "framer-motion";
import { Award, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { SITE_NAME } from "@/lib/constants";
import { DURATION, EASE, fadeUp, stagger } from "@/lib/motion";

const STATS = [
  { value: "100%", label: "Free Courses", subtext: "Zero tuition, forever" },
  { value: "24/7", label: "AI Mentor Support", subtext: "Instant help when stuck" },
];

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-transparent transition-colors duration-300">
      {/* Ambient background glows that simulate physical light source */}
      <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] z-0 h-[38rem] w-[38rem] rounded-full bg-accent-500/12 blur-[140px] dark:bg-accent-500/10" />
      <div className="pointer-events-none absolute right-[-8rem] top-[20%] z-0 h-[32rem] w-[32rem] rounded-full bg-purple-500/10 blur-[130px] dark:bg-purple-500/8" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 sm:pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center">

          {/* Left Text Content */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col items-start text-left"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 neu-pressed-sm inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>{SITE_NAME} Academy</span>
              <span className="h-3 w-px bg-black/10 dark:bg-white/10" />
              <span className="text-accent-600 dark:text-accent-400 font-semibold lowercase">free for everyone</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-heading text-5xl font-extrabold leading-[1.12] tracking-tight text-slate-900 dark:text-white sm:text-6xl md:text-7xl max-w-2xl"
            >
              Learn modern tech{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 via-indigo-500 to-purple-600 dark:from-accent-400 dark:via-indigo-300 dark:to-purple-400">
                completely free.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300 md:text-xl leading-relaxed"
            >
              Master Python, Artificial Intelligence, and automation in Urdu/Hindi. Watch step-by-step tutorials, complete practical assignments, get instant AI feedback, and earn accredited certificates.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-5">
              <Link href="/signup">
                <Button size="lg" className="neu-btn-primary rounded-full px-8 py-4 text-base font-bold">
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="secondary" className="neu-btn rounded-full px-8 py-4 text-base font-semibold text-slate-800 dark:text-slate-100">
                  Explore Courses
                </Button>
              </Link>
            </motion.div>

            {/* Quick trust micro-strip */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Urdu & Hindi lectures
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Shareable certificates
              </span>
            </motion.div>
          </motion.div>

          {/* Right Image/Illustration Content with Neumorphic Extruded Frame */}
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            {/* Outer Neumorphic Bezel Frame */}
            <div className="neu-flat-lg rounded-3xl p-3 sm:p-4 relative">
              {/* Inner recessed tray */}
              <div className="neu-pressed-sm rounded-2xl overflow-hidden relative aspect-square group">
                <Image
                  src={heroIllustration}
                  alt="Student learning AI and Programming"
                  fill
                  placeholder="blur"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-40 pointer-events-none" />
              </div>

              {/* Floating badge: 100% Free tactile capsule */}
              <div className="absolute -bottom-6 -left-6 hidden animate-float neu-flat rounded-2xl p-4 sm:flex items-center gap-3.5 z-20">
                <div className="neu-pressed rounded-full h-11 w-11 flex items-center justify-center text-emerald-500 bg-emerald-500/10">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">100% Free</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quality Tech Education</p>
                </div>
              </div>

              {/* Floating badge: Verified Certification tactile capsule */}
              <div className="absolute -top-5 -right-5 hidden animate-float neu-flat rounded-2xl px-4 py-3 sm:flex items-center gap-3 z-20" style={{ animationDelay: "2s" }}>
                <div className="neu-pressed rounded-full h-9 w-9 flex items-center justify-center text-accent-600 dark:text-accent-400 bg-accent-500/10">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Verified Certificates</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Issued on Completion</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Neumorphic Stats Console */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-16">
        <div className="neu-flat rounded-3xl p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.reveal, delay: 0.35 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="neu-pressed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:scale-[1.01]"
              >
                <span className="font-heading text-4xl sm:text-5xl font-extrabold tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-indigo-600 dark:from-accent-400 dark:to-indigo-300">
                  <CountUp value={stat.value} />
                </span>
                <span className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {stat.label}
                </span>
                <span className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {stat.subtext}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

