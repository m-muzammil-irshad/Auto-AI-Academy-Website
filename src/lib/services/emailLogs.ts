import {
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  type Timestamp,
} from "firebase/firestore";
import { emailDeliveryLogsCol } from "@/lib/firebase/collections";

export type LifecycleCategory =
  | "all"
  | "manual_broadcast"
  | "enrollment_welcome"
  | "inactive_48h"
  | "new_assignment"
  | "reminder_24h"
  | "submission_received"
  | "missed_deadline"
  | "submission_graded"
  | "leaderboard_rank"
  | "course_completed_eligible"
  | "course_completed_catchup"
  | "catchup_80_percent_reached"
  | "new_course_published"
  | "course_status_ongoing";

export interface EmailDeliveryRecord {
  id?: string;
  category: string;
  campaignLabel: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  previewSnippet: string;
  bodyContent?: string;
  courseTitle?: string;
  assignmentTitle?: string;
  status: "delivered" | "failed";
  error?: string;
  sentAt?: Timestamp | any;
}

export const CATEGORY_LABELS: Record<string, { label: string; badge: string; color: string }> = {
  all: { label: "All Email Dispatches", badge: "All", color: "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-800" },
  manual_broadcast: { label: "Manual Broadcast", badge: "Manual", color: "text-blue-700 bg-blue-500/10 dark:text-blue-400" },
  enrollment_welcome: { label: "Course Welcome", badge: "Welcome", color: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400" },
  inactive_48h: { label: "48h Inactive Signup", badge: "Re-engage", color: "text-amber-700 bg-amber-500/10 dark:text-amber-400" },
  new_assignment: { label: "New Assignment Alert", badge: "Assignment", color: "text-purple-700 bg-purple-500/10 dark:text-purple-400" },
  reminder_24h: { label: "24h Deadline Reminder", badge: "Urgent 24h", color: "text-rose-700 bg-rose-500/10 dark:text-rose-400" },
  submission_received: { label: "Submission Receipt", badge: "Received", color: "text-teal-700 bg-teal-500/10 dark:text-teal-400" },
  missed_deadline: { label: "Missed Deadline Follow-up", badge: "Motivation", color: "text-orange-700 bg-orange-500/10 dark:text-orange-400" },
  submission_graded: { label: "Graded & Stars Breakdown", badge: "Graded", color: "text-indigo-700 bg-indigo-500/10 dark:text-indigo-400" },
  leaderboard_rank: { label: "Top 10 Leaderboard", badge: "Top 10", color: "text-yellow-700 bg-yellow-500/10 dark:text-yellow-400" },
  course_completed_eligible: { label: "Course Graduated (80%+)", badge: "Certificate", color: "text-emerald-800 bg-emerald-500/15 dark:text-emerald-300" },
  course_completed_catchup: { label: "Catch-up Window Open", badge: "Catch-up", color: "text-cyan-700 bg-cyan-500/10 dark:text-cyan-400" },
  catchup_80_percent_reached: { label: "Catch-up Graduated (80%)", badge: "Certificate", color: "text-emerald-800 bg-emerald-500/15 dark:text-emerald-300" },
  new_course_published: { label: "New Course Published", badge: "New Course", color: "text-sky-700 bg-sky-500/10 dark:text-sky-400" },
  course_status_ongoing: { label: "Course Status Live", badge: "Live Now", color: "text-green-700 bg-green-500/10 dark:text-green-400" },
};

/** Record a delivery log entry in Firestore */
export async function recordEmailDelivery(record: Omit<EmailDeliveryRecord, "id" | "sentAt">): Promise<string | null> {
  try {
    const docRef = await addDoc(emailDeliveryLogsCol(), {
      ...record,
      sentAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.warn("Could not save delivery log to Firestore:", err);
    return null;
  }
}

/** Fetch recent delivery history, optionally filtered by category */
export async function fetchEmailDeliveryLogs(
  categoryFilter: string = "all",
  maxLimit: number = 100
): Promise<EmailDeliveryRecord[]> {
  try {
    let snap;
    try {
      let q;
      if (categoryFilter && categoryFilter !== "all") {
        q = query(
          emailDeliveryLogsCol(),
          where("category", "==", categoryFilter),
          orderBy("sentAt", "desc"),
          limit(maxLimit)
        );
      } else {
        q = query(
          emailDeliveryLogsCol(),
          orderBy("sentAt", "desc"),
          limit(maxLimit)
        );
      }
      snap = await getDocs(q);
    } catch (queryErr: any) {
      // Fallback if composite index is missing or orderBy field is unindexed
      console.warn("Compound delivery log query failed, using resilient fallback:", queryErr?.message || queryErr);
      const fallbackQ = query(emailDeliveryLogsCol(), limit(maxLimit));
      snap = await getDocs(fallbackQ);
    }

    const records: EmailDeliveryRecord[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<EmailDeliveryRecord, "id">),
    }));

    // In-memory sort by sentAt descending
    records.sort((a, b) => {
      const getMillis = (ts: any): number => {
        if (!ts) return 0;
        if (typeof ts.toMillis === "function") return ts.toMillis();
        if (typeof ts.toDate === "function") return ts.toDate().getTime();
        if (typeof ts === "number") return ts;
        if (ts.seconds) return ts.seconds * 1000;
        return new Date(ts).getTime() || 0;
      };
      return getMillis(b.sentAt) - getMillis(a.sentAt);
    });

    if (categoryFilter && categoryFilter !== "all") {
      return records.filter((r) => r.category === categoryFilter);
    }

    return records;
  } catch (err) {
    console.error("Could not fetch email delivery logs:", err);
    return [];
  }
}
