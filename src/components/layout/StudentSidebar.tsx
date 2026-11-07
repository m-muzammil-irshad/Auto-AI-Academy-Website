"use client";

import { useState, useEffect, useId } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STUDENT_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { WhatsAppButton } from "./WhatsAppButton";
import { Spinner } from "@/components/ui/Spinner";
import { DURATION, EASE } from "@/lib/motion";

function NavIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-5 w-5",
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 12l9-9 9 9M5 10v10h14V10" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 01-3-3V4z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <path d="M9 4h6v3H9zM6 7h12v13H6zM9 12h6M9 16h4" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M5 4h14v4a7 7 0 01-14 0V4zm0 0H3v2a3 3 0 003 3m14-5h2v2a3 3 0 01-3 3M9 20h6M12 15v5" />
        </svg>
      );
    case "award":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="6" />
          <path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0116 0" />
        </svg>
      );
    default:
      return null;
  }
}

export interface StudentSidebarProps {
  onNavigate?: () => void;
}

export function StudentSidebar({ onNavigate }: StudentSidebarProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  // Desktop and mobile copies of the sidebar each animate their own highlight.
  const highlightId = useId();

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <div className="flex h-full flex-col bg-transparent">
      <nav className="flex-1 space-y-1 p-3">
        {STUDENT_NAV.map((item) => {
          const active =
            item.href === "/student"
              ? pathname === "/student"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={() => {
                setPendingHref(item.href);
                onNavigate?.();
              }}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
              )}
            >
              <span className="relative flex flex-1 items-center gap-3">
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
                {pendingHref === item.href && (
                  <Spinner className="ml-auto h-3.5 w-3.5 text-indigo-500" />
                )}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 dark:border-slate-800/80 p-3.5">
        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <WhatsAppButton className="h-8 w-8" />
          <span>Need help? Chat with us</span>
        </div>
      </div>
    </div>
  );
}