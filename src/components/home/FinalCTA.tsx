"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function FinalCTA() {
  return (
    <section className="relative bg-transparent transition-colors duration-200 py-16 sm:py-24">
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 sm:p-14 shadow-sm"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
            <span>Get started</span>
          </div>
          <h2 className="font-heading text-3xl font-medium tracking-tight text-slate-900 dark:text-white sm:text-4xl max-w-xl mx-auto">
            Ready to begin learning?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Create an account to start your first course, submit practical assignments, and earn verified certificates. Completely free.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="rounded-lg px-6 py-3 text-sm font-medium shadow-sm inline-flex items-center gap-2">
                <span>Create free account</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
