import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import type { CourseStatus } from "@/lib/types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

const variants: Record<BadgeVariant, string> = {
  default: "neu-pressed-sm text-slate-700 dark:text-slate-300 border-none font-semibold",
  success: "neu-pressed-sm text-emerald-700 dark:text-emerald-300 border-none font-semibold",
  warning: "neu-pressed-sm text-amber-700 dark:text-amber-300 border-none font-semibold",
  danger: "neu-pressed-sm text-red-700 dark:text-red-300 border-none font-semibold",
  info: "neu-pressed-sm text-blue-700 dark:text-blue-300 border-none font-semibold",
  neutral: "neu-pressed-sm text-slate-700 dark:text-slate-300 border-none font-semibold",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "default",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export function courseStatusVariant(
  status: CourseStatus
): BadgeVariant {
  switch (status) {
    case "ongoing":
      return "success";
    case "soon":
      return "warning";
    case "completed":
      return "neutral";
  }
}