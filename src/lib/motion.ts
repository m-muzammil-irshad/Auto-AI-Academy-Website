import type { Variants } from "framer-motion";

// Shared motion language: one easing curve, three speeds, small distances.
// Keep EASE in sync with `ease-smooth` in tailwind.config.ts.
export const EASE = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  hover: 0.15,
  ui: 0.25,
  reveal: 0.5,
} as const;

/** Fade in while rising a few pixels. Use for anything that enters the page. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE } },
};

/** Parent that reveals its `fadeUp` children one after another. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

/** Scroll-triggered reveals play once, slightly after the element enters view. */
export const viewportOnce = { once: true, margin: "-80px" } as const;
