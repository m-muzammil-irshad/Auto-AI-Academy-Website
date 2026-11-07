"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-transparent transition-colors duration-300 py-20 sm:py-28">
      {/* Soft ambient back light */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="neu-flat-lg rounded-3xl p-10 sm:p-16 relative overflow-hidden"
        >
          <div className="mb-4 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            <Sparkles className="h-4 w-4" />
            <span>Join Hundreds of Active Learners</span>
          </div>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl max-w-2xl mx-auto leading-tight">
            Ready to start <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 via-indigo-500 to-purple-600 dark:from-accent-400 dark:via-indigo-300 dark:to-purple-400">learning?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Create your free account today and dive into your first Python or AI course in under 60 seconds. No credit card required.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="neu-btn-primary rounded-full px-10 py-5 text-lg font-bold inline-flex items-center gap-3">
                <span>Create Free Account</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

