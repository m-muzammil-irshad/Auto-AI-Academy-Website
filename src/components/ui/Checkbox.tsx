"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, error, className, id, ...rest }, ref) {
    const reactId = useId();
    const inputId = id ?? reactId;
    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="flex cursor-pointer items-start gap-2 text-sm text-slate-700 dark:text-slate-300"
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              "mt-0.5 h-4 w-4 rounded-md neu-pressed-sm border-none text-accent-600 dark:text-accent-400 accent-accent-600 dark:accent-accent-500",
              "focus:ring-0 disabled:cursor-not-allowed",
              className
            )}
            {...rest}
          />
          <span>{label}</span>
        </label>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);