"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-600/90 hover:bg-accent-600 backdrop-blur-md text-white shadow-sm hover:shadow-accent-500/25 disabled:bg-accent-600/50 dark:bg-accent-500/90 dark:hover:bg-accent-500 dark:disabled:bg-accent-500/50 transition-all",
  secondary:
    "bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-slate-900 dark:text-white border border-slate-300/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50 dark:bg-red-500 dark:hover:bg-red-600",
  ghost:
    "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", loading, disabled, className, children, ...rest },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...rest}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {children}
      </button>
    );
  }
);