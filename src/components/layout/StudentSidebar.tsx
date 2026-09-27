"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STUDENT_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import { WhatsAppButton } from "./WhatsAppButton";

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

  return (
    <div className="flex h-full flex-col bg-white">
      <nav className="flex-1 space-y-1 p-4">
        {STUDENT_NAV.map((item) => {
          const active =
            item.href === "/student"
              ? pathname === "/student"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent-50 text-accent-700"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <WhatsAppButton className="h-9 w-9" />
          <span>Need help? Chat with support.</span>
        </div>
      </div>
    </div>
  );
}