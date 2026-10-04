"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  position?: "center" | "left" | "right";
}

export function Tooltip({ content, children, className, position = "center" }: TooltipProps) {
  const positionClasses = {
    center: "left-1/2 -translate-x-1/2",
    left: "left-0",
    right: "right-0",
  };

  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full z-40 mb-2 w-max max-w-[250px] sm:max-w-xs scale-95 whitespace-normal rounded-md bg-slate-900 px-3 py-2 text-xs font-normal text-white opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100",
          positionClasses[position]
        )}
      >
        {content}
      </span>
    </span>
  );
}
