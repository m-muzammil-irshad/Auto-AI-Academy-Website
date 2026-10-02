"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-transparent transition-colors duration-300">
      <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-30 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-blue-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.2 }}
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
              <Button size="lg" className="rounded-full px-10 py-6 text-lg font-bold shadow-xl shadow-accent-500/30 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent-500/40">
                Create free account
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
