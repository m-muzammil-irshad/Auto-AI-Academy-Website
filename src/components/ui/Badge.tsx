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
  default: "bg-slate-100 text-slate-700",
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
  neutral: "bg-slate-200 text-slate-700",
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