"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import { NotificationList } from "@/components/notifications/NotificationList";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

export default function StudentNotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
  } = useNotifications(user?.uid);

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You’re all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </motion.div>

      {error && (
        <EmptyState title="Could not load notifications" description={error} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4"
            >
              <Skeleton className="mb-2 h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="Updates about grading, new assignments, and new courses will show up here."
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden"
        >
          <NotificationList
            items={notifications}
            onItemClick={(id) => {
              const item = notifications.find((n) => n.id === id);
              if (item && !item.read) void markRead(id);
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
