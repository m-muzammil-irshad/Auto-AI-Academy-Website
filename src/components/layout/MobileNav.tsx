"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DURATION, EASE } from "@/lib/motion";

export interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MobileNav({ open, onClose, children }: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <motion.div
            role="presentation"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.ui }}
            className="absolute inset-0 bg-slate-900/40 dark:bg-black/60"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: DURATION.ui, ease: EASE }}
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950"
          >
            {children}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
