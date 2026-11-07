"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, hint, className, id, ...rest }, ref) {
    const reactId = useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full rounded-xl neu-pressed-sm px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all dark:text-slate-100 dark:placeholder:text-slate-500",
            error
              ? "border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-600 dark:focus:border-red-600"
              : "border border-transparent focus:border-accent-500 focus:ring-1 focus:ring-accent-500",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
          aria-invalid={!!error}
          {...rest}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);