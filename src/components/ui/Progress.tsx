"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { EASE } from "@/lib/motion";

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

export interface ProgressBarProps {
  /** Completion from 0 to 1. */
  value: number;
  label: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const percent = Math.round(clamp(value) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800", className)}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.8, ease: EASE }}
        className="h-full rounded-full bg-gradient-to-r from-accent-500 to-purple-500"
      />
    </div>
  );
}

export interface ProgressRingProps {
  /** Completion from 0 to 1. */
  value: number;
  /** Value at which the ring turns green, e.g. 0.8 for the certificate threshold. */
  target?: number;
  label: string;
  size?: number;
  className?: string;
}

export function ProgressRing({ value, target = 1, label, size = 56, className }: ProgressRingProps) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = clamp(value);
  const percent = Math.round(clamped * 100);
  const reached = clamped >= target;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: 0.9, ease: EASE }}
          className={reached ? "stroke-emerald-500" : "stroke-accent-500"}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-200">
        {percent}%
      </span>
    </div>
  );
}
