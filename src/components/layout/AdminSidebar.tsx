"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/Spinner";

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
    case "check":
      return (
        <svg {...common}>
          <path d="M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M2 20a7 7 0 0114 0M16 11a3 3 0 100-6M22 20a7 7 0 00-4-6.32" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
        </svg>
      );
    default:
      return null;
  }
}

export interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <div className="flex h-full flex-col bg-transparent">
      <nav className="flex-1 space-y-1 p-4">
        {ADMIN_NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
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
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-50 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              <NavIcon name={item.icon} />
              {item.label}
              {pendingHref === item.href && (
                <Spinner className="ml-auto h-4 w-4 text-accent-500" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200/50 dark:border-slate-800/50 p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Admin Panel · Auto AI Academy
        </p>
      </div>
    </div>
  );
}