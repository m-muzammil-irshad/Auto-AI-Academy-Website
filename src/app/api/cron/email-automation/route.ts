import { NextResponse } from "next/server";
import { fetchAllUsers } from "@/lib/services/users";
import { fetchEnrollmentsForUser, fetchEnrollmentsForCourse } from "@/lib/services/enrollments";
import { fetchCourses } from "@/lib/services/courses";
import { fetchAllAssignments } from "@/lib/services/assignments";
import { fetchSubmissionsForAssignment } from "@/lib/services/submissions";
import { formatDateTime } from "@/lib/utils/dates";
import {
  sendInactiveSignupEmail,
  sendAssignmentDeadlineReminderEmail,
  sendMissedDeadlineEmail,
} from "@/lib/services/lifecycleEmail";
import { addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { emailBroadcastsCol } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/config";
import { collection } from "firebase/firestore";

export const dynamic = "force-dynamic";

// In-memory deduplication set for server runtime lifecycle
const memorySentKeys = new Set<string>();

// Collection to prevent duplicate lifecycle reminder emails
function automationLogsCol() {
  return collection(db, "emailAutomationLogs");
}

async function isAlreadyLogged(logId: string): Promise<boolean> {
  if (memorySentKeys.has(logId)) return true;
  try {
    const snap = await getDocs(
      query(automationLogsCol(), where("logKey", "==", logId))
    );
    if (!snap.empty) {
      memorySentKeys.add(logId);
      return true;
    }
  } catch (err) {
    // If permission or cloud rules don't permit read, fallback to memory deduplication
    console.warn(`Could not check Firestore log for ${logId}, relying on runtime cache:`, err);
  }
  return false;
}

async function markAsLogged(logId: string, data: Record<string, any>): Promise<void> {
  memorySentKeys.add(logId);
  try {
    await addDoc(automationLogsCol(), {
      logKey: logId,
      ...data,
      sentAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn(`Could not persist Firestore log for ${logId}:`, err);
  }
}

export async function GET(request: Request) {
  return handleAutomationChecks(request);
}

export async function POST(request: Request) {
  return handleAutomationChecks(request);
}

async function handleAutomationChecks(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results = {
    inactiveEmailsSent: 0,
    deadlineRemindersSent: 0,
    missedDeadlineEmailsSent: 0,
    errors: [] as string[],
  };

  const now = Date.now();
  const msInHour = 60 * 60 * 1000;
  const msInDay = 24 * msInHour;

  let passedData: {
    users?: any[];
    courses?: any[];
    enrollments?: any[];
    submissions?: any[];
    assignments?: any[];
  } = {};

  try {
    if (request.method === "POST") {
      passedData = await request.json().catch(() => ({}));
    }
  } catch {
    passedData = {};
  }

  try {
    // -------------------------------------------------------------------------
    // 1. Inactive Students (Signed up >= 48 hours ago, 0 course enrollments)
    // -------------------------------------------------------------------------
    try {
      const allUsers = passedData.users && Array.isArray(passedData.users)
        ? passedData.users
        : await fetchAllUsers();

      // Enrollment lookup map
      const enrollmentUserIds = new Set<string>();
      if (passedData.enrollments && Array.isArray(passedData.enrollments)) {
        passedData.enrollments.forEach((e) => enrollmentUserIds.add(e.userId));
      }

      for (const u of allUsers) {
        if (!u.email || u.role !== "student") continue;

        let createdMillis = 0;
        if (u.createdAt) {
          if (typeof u.createdAt.toMillis === "function") {
            createdMillis = u.createdAt.toMillis();
          } else if (typeof u.createdAt === "number") {
            createdMillis = u.createdAt;
          } else if (u.createdAt.seconds) {
            createdMillis = u.createdAt.seconds * 1000;
          }
        }

        const hoursSinceSignup = (now - createdMillis) / msInHour;

        // Check if signed up between 48 hours and 7 days ago
        if (hoursSinceSignup >= 48 && hoursSinceSignup <= 168) {
          let hasEnrollment = false;
          if (passedData.enrollments && Array.isArray(passedData.enrollments)) {
            hasEnrollment = enrollmentUserIds.has(u.uid);
          } else {
            const enrollments = await fetchEnrollmentsForUser(u.uid);
            hasEnrollment = enrollments.length > 0;
          }

          if (!hasEnrollment) {
            const logId = `inactive_48h_${u.uid}`;
            const alreadySent = await isAlreadyLogged(logId);

            if (!alreadySent) {
              const sent = await sendInactiveSignupEmail({
                studentEmail: u.email,
                studentName: u.name || "Student",
              });

              if (sent) {
                results.inactiveEmailsSent++;
                await markAsLogged(logId, {
                  userId: u.uid,
                  type: "inactive_48h",
                });
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Error in inactive student check:", err);
      results.errors.push(`Inactive check: ${err.message}`);
    }

    // -------------------------------------------------------------------------
    // 2. 24-Hour Assignment Deadline Reminders & 3. Missed Deadline Follow-ups
    // -------------------------------------------------------------------------
    try {
      const courses = passedData.courses && Array.isArray(passedData.courses)
        ? passedData.courses
        : await fetchCourses();
      const courseMap = new Map(courses.map((c) => [c.id, c]));

      const assignments = passedData.assignments && Array.isArray(passedData.assignments)
        ? passedData.assignments
        : await fetchAllAssignments();

      // Pre-index enrollments & submissions if passed
      const enrollmentsByCourse = new Map<string, any[]>();
      if (passedData.enrollments && Array.isArray(passedData.enrollments)) {
        passedData.enrollments.forEach((e) => {
          const list = enrollmentsByCourse.get(e.courseId) || [];
          list.push(e);
          enrollmentsByCourse.set(e.courseId, list);
        });
      }

      const submissionsByAssignment = new Map<string, any[]>();
      if (passedData.submissions && Array.isArray(passedData.submissions)) {
        passedData.submissions.forEach((s) => {
          const list = submissionsByAssignment.get(s.assignmentId) || [];
          list.push(s);
          submissionsByAssignment.set(s.assignmentId, list);
        });
      }

      const userMap = new Map<string, any>();
      if (passedData.users && Array.isArray(passedData.users)) {
        passedData.users.forEach((u) => userMap.set(u.uid, u));
      }

      for (const a of assignments) {
        const course = courseMap.get(a.courseId);
        // Skip completed courses
        if (!course || course.status === "completed") continue;

        let dueMillis = 0;
        if (a.dueDate) {
          if (typeof a.dueDate.toMillis === "function") {
            dueMillis = a.dueDate.toMillis();
          } else if (typeof a.dueDate === "number") {
            dueMillis = a.dueDate;
          } else if (a.dueDate.seconds) {
            dueMillis = a.dueDate.seconds * 1000;
          }
        }
        if (!dueMillis) continue;

        const timeDiff = dueMillis - now; // positive = future, negative = past

        const enrollments = enrollmentsByCourse.has(a.courseId)
          ? enrollmentsByCourse.get(a.courseId)!
          : await fetchEnrollmentsForCourse(a.courseId);

        if (enrollments.length === 0) continue;

        const submissions = submissionsByAssignment.has(a.id)
          ? submissionsByAssignment.get(a.id)!
          : await fetchSubmissionsForAssignment(a.id);

        const submittedUserIds = new Set(submissions.map((s) => s.userId));

        // A. 24-Hour Reminder: due within next 24 hours (0 to 24h)
        if (timeDiff > 0 && timeDiff <= msInDay) {
          for (const e of enrollments) {
            if (!submittedUserIds.has(e.userId)) {
              const logId = `reminder_24h_${a.id}_${e.userId}`;
              const alreadySent = await isAlreadyLogged(logId);

              if (!alreadySent) {
                let student = userMap.get(e.userId);
                if (!student) {
                  const { getUserProfile } = await import("@/lib/services/users");
                  student = await getUserProfile(e.userId);
                }

                if (student?.email) {
                  const sent = await sendAssignmentDeadlineReminderEmail({
                    studentEmail: student.email,
                    studentName: student.name || "Student",
                    courseTitle: course.title,
                    assignmentTitle: a.title,
                    dueDateFormatted: formatDateTime(a.dueDate),
                  });

                  if (sent) {
                    results.deadlineRemindersSent++;
                    await markAsLogged(logId, {
                      userId: e.userId,
                      assignmentId: a.id,
                      type: "reminder_24h",
                    });
                  }
                }
              }
            }
          }
        }

        // B. Missed Deadline Follow-up: passed within past 24 hours (0 to -24h)
        if (timeDiff < 0 && timeDiff >= -msInDay) {
          for (const e of enrollments) {
            if (!submittedUserIds.has(e.userId)) {
              const logId = `missed_deadline_${a.id}_${e.userId}`;
              const alreadySent = await isAlreadyLogged(logId);

              if (!alreadySent) {
                let student = userMap.get(e.userId);
                if (!student) {
                  const { getUserProfile } = await import("@/lib/services/users");
                  student = await getUserProfile(e.userId);
                }

                if (student?.email) {
                  const sent = await sendMissedDeadlineEmail({
                    studentEmail: student.email,
                    studentName: student.name || "Student",
                    courseTitle: course.title,
                    assignmentTitle: a.title,
                  });

                  if (sent) {
                    results.missedDeadlineEmailsSent++;
                    await markAsLogged(logId, {
                      userId: e.userId,
                      assignmentId: a.id,
                      type: "missed_deadline",
                    });
                  }
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Error in assignment deadline check:", err);
      results.errors.push(`Deadline check: ${err.message}`);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json(
      { error: error.message || "Cron job failed" },
      { status: 500 }
    );
  }
}
