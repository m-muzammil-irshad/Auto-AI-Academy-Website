import {
  QueryConstraint,
  Timestamp,
  addDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  notificationDoc,
  notificationsCol,
} from "@/lib/firebase/collections";
import type { AppNotification, NotificationType } from "@/lib/types";

function mapNotification(
  id: string,
  data: Record<string, unknown>
): AppNotification {
  return {
    id,
    message: (data.message as string) ?? "",
    link: data.link as string | undefined,
    type: (data.type as NotificationType) ?? "general",
    createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
    read: !!data.read,
  };
}

export async function fetchNotifications(
  userId: string,
  max?: number
): Promise<AppNotification[]> {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (typeof max === "number") constraints.push(fbLimit(max));
  const snap = await getDocs(
    query(notificationsCol(userId), ...constraints)
  );
  return snap.docs.map((d) => mapNotification(d.id, d.data()));
}

export async function markNotificationRead(
  userId: string,
  id: string
): Promise<void> {
  await updateDoc(notificationDoc(userId, id), { read: true });
}

export async function markAllNotificationsRead(
  userId: string
): Promise<void> {
  const list = await fetchNotifications(userId);
  await Promise.all(
    list
      .filter((n) => !n.read)
      .map((n) => markNotificationRead(userId, n.id))
  );
}

/**
 * Create a notification for a user.
 * Called by admin-side actions (grading, new assignment, new course).
 * The security rules allow only admin-role clients to write to this path.
 */
export async function pushNotification(params: {
  userId: string;
  message: string;
  link?: string;
  type: NotificationType;
}): Promise<void> {
  await addDoc(notificationsCol(params.userId), {
    message: params.message,
    ...(params.link ? { link: params.link } : {}),
    type: params.type,
    createdAt: serverTimestamp(),
    read: false,
  });
}