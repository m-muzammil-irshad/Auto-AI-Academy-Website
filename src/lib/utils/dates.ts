import { Timestamp } from "firebase/firestore";

export type DateLike =
  | Timestamp
  | { seconds: number; nanoseconds?: number }
  | Date
  | string
  | number
  | null
  | undefined;

/** UTC "YYYY-MM" key used for monthlyStars buckets. */
export function monthKey(date: Date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function tsToDate(ts: DateLike): Date | null {
  if (!ts) return null;
  if (ts instanceof Date) {
    return isNaN(ts.getTime()) ? null : ts;
  }
  if (typeof (ts as { toDate?: () => Date }).toDate === "function") {
    try {
      const d = (ts as Timestamp).toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }
  if (
    typeof ts === "object" &&
    "seconds" in ts &&
    typeof (ts as { seconds: number }).seconds === "number"
  ) {
    const ms =
      (ts as { seconds: number; nanoseconds?: number }).seconds * 1000 +
      Math.floor(((ts as { nanoseconds?: number }).nanoseconds ?? 0) / 1000000);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof ts === "string" || typeof ts === "number") {
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function formatDate(ts: DateLike): string {
  const d = tsToDate(ts);
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(ts: DateLike): string {
  const d = tsToDate(ts);
  if (!d) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(ts: DateLike): string {
  const d = tsToDate(ts);
  if (!d) return "";
  const then = d.getTime();
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? "" : "s"} ago`;
  return formatDate(d);
}

export function isPast(ts: DateLike): boolean {
  const d = tsToDate(ts);
  if (!d) return false;
  return d.getTime() < Date.now();
}

/** Returns a Date suitable for `<input type="date">` (local). */
export function toDateInputValue(ts: DateLike): string {
  const d = tsToDate(ts);
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
