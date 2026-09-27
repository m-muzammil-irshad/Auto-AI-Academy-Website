import type { Grading } from "@/lib/types";

export const CRITERIA_MAX = 5;

/** Average of the three criteria, rounded to 1 decimal place. */
export function computeFinalStars(
  correctness: number,
  creativity: number,
  timeliness: number
): number {
  const avg = (correctness + creativity + timeliness) / 3;
  return Math.round(avg * 10) / 10;
}

export function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > CRITERIA_MAX) return CRITERIA_MAX;
  return Math.round(n * 2) / 2; // half-star steps
}

export function isGraded(g: Grading | null | undefined): g is Grading {
  return !!g && typeof g.finalStars === "number";
}