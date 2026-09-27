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
    "bg-accent-600 text-white hover:bg-accent-700 disabled:bg-accent-600/50",
  secondary:
    "bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 disabled:opacity-50",
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
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed",
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