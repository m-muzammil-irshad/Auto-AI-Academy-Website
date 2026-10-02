"use client";

import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className, id, ...rest }, ref) {
    const reactId = useId();
    const textareaId = id ?? reactId;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rest.rows ?? 4}
          className={cn(
            "block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500",
            error
              ? "border-red-500 focus:border-red-500 dark:border-red-600 dark:focus:border-red-600"
              : "border-slate-300 focus:border-accent-500 dark:border-slate-700 dark:focus:border-accent-500",
            "disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900",
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