"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DURATION, EASE, fadeUp, viewportOnce } from "@/lib/motion";
import { FAQS } from "@/lib/faqs";


export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative bg-transparent py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block font-heading text-sm font-bold tracking-widest text-accent-600 dark:text-accent-400 uppercase">
            FAQ
          </span>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Questions, answered
          </h2>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="card-surface divide-y divide-slate-200/60 bg-white/80 dark:divide-slate-800/60 dark:bg-slate-900/80"
        >
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-heading text-base font-semibold text-slate-900 transition-colors duration-150 hover:text-accent-600 dark:text-white dark:hover:text-accent-400 sm:text-lg"
                  >
                    {item.q}
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ease-smooth ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: DURATION.ui, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
