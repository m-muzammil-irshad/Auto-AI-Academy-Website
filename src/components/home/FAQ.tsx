"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
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
          className="mb-14 text-center"
        >
          <div className="mb-4 neu-pressed-sm inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
            <HelpCircle className="h-4 w-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Frequently <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">Answered</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Everything you need to know about our free curriculum, certificates, and community.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="space-y-4"
        >
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="neu-flat rounded-2xl overflow-hidden transition-all duration-300"
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-heading text-base sm:text-lg font-bold text-slate-900 transition-colors duration-150 hover:text-accent-600 dark:text-white dark:hover:text-accent-400"
                  >
                    <span>{item.q}</span>
                    <div className="neu-pressed-sm h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                      <ChevronDown
                        aria-hidden="true"
                        className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform duration-300 ease-smooth ${
                          isOpen ? "rotate-180 text-accent-600 dark:text-accent-400" : ""
                        }`}
                      />
                    </div>
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
                      <div className="neu-pressed-sm rounded-xl p-5 mx-6 mb-5">
                        <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                          {item.a}
                        </p>
                      </div>
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

