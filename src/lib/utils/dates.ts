import { Timestamp } from "firebase/firestore";

/** UTC "YYYY-MM" key used for monthlyStars buckets. */
export function monthKey(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function tsToDate(ts: Timestamp | null | undefined): Date | null {
  if (!ts) return null;
  return ts.toDate();
}

export function formatDate(ts: Timestamp | null | undefined): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(ts: Timestamp | null | undefined): string {
  if (!ts) return "";
  const then = ts.toDate().getTime();
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return formatDate(ts);
}

export function isPast(ts: Timestamp | null | undefined): boolean {
  if (!ts) return false;
  return ts.toDate().getTime() < Date.now();
}

/** Returns a Date suitable for `<input type="date">` (local). */
export function toDateInputValue(ts: Timestamp | null | undefined): string {
  if (!ts) return "";
  const d = ts.toDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}