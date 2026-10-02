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
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700 border border-transparent",
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50 border border-transparent",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50 border border-transparent",
  danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50 border border-transparent",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50 border border-transparent",
  neutral: "bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600/50 border border-transparent",
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