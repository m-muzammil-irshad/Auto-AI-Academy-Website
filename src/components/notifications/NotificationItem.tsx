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

import { useRouter } from "next/navigation";

export function NotificationItem({ item, onClick }: NotificationItemProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.(item.id);
        if (item.link) {
          router.push(item.link);
        }
      }}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-left transition-all duration-200",
        item.read
          ? "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
          : "neu-pressed-sm my-1"
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs",
          item.read
            ? "neu-pressed-sm text-slate-500 dark:text-slate-400"
            : "neu-flat text-accent-600 dark:text-accent-400 font-bold"
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