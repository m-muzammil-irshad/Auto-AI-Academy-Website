"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/services/notifications";
import type { AppNotification } from "@/lib/types";

export interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export function useNotifications(
  userId: string | null | undefined,
  max?: number
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const list = await fetchNotifications(userId, max);
      setNotifications(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [userId, max]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const markRead = useCallback(
    async (id: string) => {
      if (!userId) return;
      await markNotificationRead(userId, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    },
    [userId]
  );

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [userId]);

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.read).length,
    loading,
    error,
    reload,
    markRead,
    markAllRead,
  };
}