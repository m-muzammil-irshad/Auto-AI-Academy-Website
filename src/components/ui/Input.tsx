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
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
            error
              ? "border-red-500 focus:border-red-500"
              : "border-slate-300 focus:border-accent-500",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            className
          )}
          aria-invalid={!!error}
          {...rest}
        />
        {hint && !error && (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);