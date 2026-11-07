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
    "neu-btn-primary text-white font-semibold disabled:opacity-50 active:scale-[0.98]",
  secondary:
    "neu-btn text-slate-800 dark:text-slate-100 font-medium disabled:opacity-50 active:scale-[0.98]",
  danger:
    "neu-btn-danger text-white font-semibold disabled:opacity-50 active:scale-[0.98]",
  ghost:
    "bg-transparent text-slate-700 dark:text-slate-300 hover:text-accent-600 dark:hover:text-accent-400 hover:neu-pressed-sm active:scale-[0.98] disabled:opacity-50",
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
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-150 ease-smooth active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100",
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