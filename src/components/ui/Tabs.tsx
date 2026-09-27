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
        "inline-flex rounded-md border border-slate-200 bg-white p-1",
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
              "rounded px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}