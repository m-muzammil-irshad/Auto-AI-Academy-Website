"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-transparent transition-colors duration-300">
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="rounded-3xl border border-white/20 bg-white/40 p-10 shadow-2xl backdrop-blur-xl dark:border-slate-700/30 dark:bg-slate-800/40 sm:p-16"
        >
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Ready to start learning?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400">
            Create a free account and enroll in your first course in under a minute. No credit card required.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-10 py-6 text-lg font-bold shadow-xl shadow-accent-500/30 hover:shadow-2xl hover:shadow-accent-500/30">
                Create free account
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
