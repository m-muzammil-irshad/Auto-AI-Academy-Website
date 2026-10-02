"use client";

import { cn } from "@/lib/utils/cn";

export interface TabItem<T extends string> {
  value: T;
  label: string;
}

export interface TabsProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  items: TabItem<T>[];
  className?: string;
}

export function Tabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-1 transition-colors",
        className
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
              active
                ? "bg-accent-600 dark:bg-accent-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}