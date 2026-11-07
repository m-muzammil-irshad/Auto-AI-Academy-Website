"use client";

import { NotificationItem } from "./NotificationItem";
import type { AppNotification } from "@/lib/types";

export interface NotificationListProps {
  items: AppNotification[];
  onItemClick?: (id: string) => void;
}

export function NotificationList({
  items,
  onItemClick,
}: NotificationListProps) {
  return (
    <ul className="divide-y divide-black/5 dark:divide-white/5">
      {items.map((n) => (
        <li key={n.id}>
          <NotificationItem item={n} onClick={onItemClick} />
        </li>
      ))}
    </ul>
  );
}