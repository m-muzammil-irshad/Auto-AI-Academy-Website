"use client";

import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, options, placeholder, className, id, ...rest },
    ref
  ) {
    const reactId = useId();
    const selectId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "block w-full rounded-xl border bg-white/50 backdrop-blur-sm px-4 py-2.5 text-sm text-slate-900 transition-all dark:bg-slate-900/50 dark:text-slate-100",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:border-red-600 dark:focus:border-red-600"
              : "border-slate-200/50 focus:border-accent-500 focus:ring-1 focus:ring-accent-500 dark:border-slate-800/50 dark:focus:border-accent-500",
            "disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900/80",
            className
          )}
          aria-invalid={!!error}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);