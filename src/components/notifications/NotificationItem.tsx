"use client";

import { cn } from "@/lib/utils/cn";
import { relativeTime } from "@/lib/utils/dates";
import type { AppNotification, NotificationType } from "@/lib/types";

function TypeIcon({ type }: { type: NotificationType }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-4 w-4",
    "aria-hidden": true,
  };
  switch (type) {
    case "grading":
      return (
        <svg {...common}>
          <path d="M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
      );
    case "new_assignment":
      return (
        <svg {...common}>
          <path d="M9 4h6v3H9zM6 7h12v13H6zM9 12h6M9 16h4" />
        </svg>
      );
    case "new_course":
      return (
        <svg {...common}>
          <path d="M4 4h11a3 3 0 013 3v13H7a3 3 0 01-3-3V4z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
      );
  }
}

export interface NotificationItemProps {
  item: AppNotification;
  onClick?: (id: string) => void;
}

export function NotificationItem({ item, onClick }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(item.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-4 py-4 text-left transition-colors",
        item.read ? "hover:bg-slate-50/50 dark:hover:bg-slate-800/50" : "bg-accent-50/40 hover:bg-accent-50 dark:bg-accent-900/20 dark:hover:bg-accent-900/40"
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          item.read
            ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            : "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300"
        )}
      >
        <TypeIcon type={item.type} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-slate-800 dark:text-white">{item.message}</span>
        <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
          {relativeTime(item.createdAt)}
        </span>
      </span>
      {!item.read && (
        <span
          className="mt-2 inline-block h-2 w-2 shrink-0 rounded-full bg-accent-600 dark:bg-accent-500"
          aria-label="Unread"
        />
      )}
    </button>
  );
}