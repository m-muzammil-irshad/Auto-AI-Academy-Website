"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/motion";

export interface CountUpProps {
  /** Display value such as "10,000+" or "100%". Non-numeric values render as-is. */
  value: string;
  className?: string;
}

/** Counts up to the number inside `value` the first time it scrolls into view. */
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    const match = value.match(/^([\d,]+)(\D*)$/);
    if (!node || !match || !inView || reduceMotion) return;
    const end = Number(match[1].replace(/,/g, ""));
    const controls = animate(0, end, {
      duration: 1.2,
      ease: EASE,
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString("en-US") + match[2];
      },
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
