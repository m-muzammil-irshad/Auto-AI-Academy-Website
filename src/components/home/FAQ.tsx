"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DURATION, EASE, fadeUp, viewportOnce } from "@/lib/motion";

const FAQS = [
  {
    q: "Are the courses really free?",
    a: "Yes. Every course on Auto AI Academy is 100% free — there is nothing to pay and no credit card is required to sign up.",
  },
  {
    q: "Where do I watch the lessons?",
    a: "Lessons are published as video tutorials on our official YouTube channels. Once you enroll, your course page links you straight to them.",
  },
  {
    q: "How do I submit assignments?",
    a: "Upload your work to Google Drive and paste the share link on the assignment page. It only takes a moment.",
  },
  {
    q: "How is my work graded?",
    a: "Each submission is scored on correctness, creativity, and timeliness. Those scores become the stars that decide your place on the leaderboard.",
  },
  {
    q: "How do I earn a certificate?",
    a: "When a course is marked completed and you have submitted at least 80% of its assignments, you can request your certificate from the Certificates page.",
  },
  {
    q: "What if I get stuck?",
    a: "The AI assistant is available around the clock from the chat button on every page, and you can reach our support team on WhatsApp.",
  },
];

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
