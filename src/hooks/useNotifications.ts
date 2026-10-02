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

const cachedNotifications: Record<string, { data: AppNotification[]; time: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useNotifications(
  userId: string | null | undefined,
  max?: number
): UseNotificationsResult {
  const key = `${userId}-${max || "all"}`;
  
  const [notifications, setNotifications] = useState<AppNotification[]>(() => 
    userId && cachedNotifications[key] ? cachedNotifications[key].data : []
  );
  const [loading, setLoading] = useState(() => 
    userId ? !cachedNotifications[key] : false
  );
  const [error, setError] = useState("");

  const reload = useCallback(async (background = false) => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    
    if (!background) setLoading(true);
    setError("");
    try {
      const list = await fetchNotifications(userId, max);
      cachedNotifications[key] = { data: list, time: Date.now() };
      setNotifications(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load notifications."
      );
    } finally {
      if (!background) setLoading(false);
    }
  }, [userId, max, key]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const cached = cachedNotifications[key];
    if (cached && Date.now() - cached.time < CACHE_DURATION) {
      setNotifications(cached.data);
      setLoading(false);
      void reload(true); // background update
    } else {
      void reload(false);
    }
  }, [userId, key, reload]);

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