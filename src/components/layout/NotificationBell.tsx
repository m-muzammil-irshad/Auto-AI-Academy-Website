"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { notificationsCol } from "@/lib/firebase/collections";

export interface NotificationBellProps {
  href: string;
}

export function NotificationBell({ href }: NotificationBellProps) {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    const q = query(notificationsCol(user.uid), where("read", "==", false));
    const unsub = onSnapshot(
      q,
      (snap) => setUnread(snap.size),
      () => setUnread(0)
    );
    return () => unsub();
  }, [user]);

  return (
    <Link
      href={href}
      aria-label="Notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}