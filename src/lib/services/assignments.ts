import {
  Timestamp,
  addDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  assignmentDoc,
  assignmentsCol,
} from "@/lib/firebase/collections";
import { assignmentsForCourse } from "@/lib/firebase/queries";
import { fetchCourse } from "@/lib/services/courses";
import type { Assignment } from "@/lib/types";

export interface AssignmentInput {
  courseId: string;
  title: string;
  description: string;
  deliverables: string[];
  dueDate: Timestamp;
}

function mapAssignment(
  id: string,
  data: Record<string, unknown>
): Assignment {
  return {
    id,
    courseId: (data.courseId as string) ?? "",
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    deliverables: Array.isArray(data.deliverables)
      ? (data.deliverables as string[])
      : [],
    dueDate: (data.dueDate as Timestamp) ?? Timestamp.now(),
    createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
  };
}

/**
 * Fetch assignments for one course, sorted by dueDate ascending (soonest first).
 * Sorting is done client-side — the where("courseId","==") query needs no index.
 */
export async function fetchAssignmentsForCourse(
  courseId: string
): Promise<Assignment[]> {
  const snap = await getDocs(assignmentsForCourse(courseId));
  const list = snap.docs.map((d) => mapAssignment(d.id, d.data()));
  return list.sort((a, b) => a.dueDate.toMillis() - b.dueDate.toMillis());
}

/**
 * Fetch assignments across many courses in parallel.
 * Avoids Firestore's 10-value cap on `where("courseId","in",[...])`.
 */
export async function fetchAssignmentsForCourses(
  courseIds: string[]
): Promise<Assignment[]> {
  if (courseIds.length === 0) return [];
  const lists = await Promise.all(courseIds.map(fetchAssignmentsForCourse));
  return lists.flat();
}

/**
 * Reject adds to a completed course — keeps the assignment list "frozen" so the
 * 80%-submission certificate calculation stays stable (see 9.3).
 */
export async function createAssignment(
  input: AssignmentInput
): Promise<string> {
  const course = await fetchCourse(input.courseId);
  if (!course) {
    throw new Error("Course not found.");
  }
  if (course.status === "completed") {
    throw new Error(
      "Cannot add assignments to a completed course. Its assignment list is frozen."
    );
  }

  const ref = await addDoc(assignmentsCol(), {
    courseId: input.courseId,
    title: input.title.trim(),
    description: input.description.trim(),
    deliverables: input.deliverables
      .map((d) => d.trim())
      .filter((d) => d.length > 0),
    dueDate: input.dueDate,
    createdAt: serverTimestamp(),
  });

  try {
    const { fetchEnrollmentsForCourse } = await import("@/lib/services/enrollments");
    const { pushNotification } = await import("@/lib/services/notifications");
    const enrollments = await fetchEnrollmentsForCourse(input.courseId);
    
    await Promise.allSettled(
      enrollments.map((e) =>
        pushNotification({
          userId: e.userId,
          message: `New Assignment! 📝 "${input.title.trim()}" in ${course.title}.`,
          link: `/student/assignments`,
          type: "general",
        })
      )
    );

    // Trigger automated lifecycle email to all enrolled students (or active students)
    if (typeof window !== "undefined") {
      void dispatchAssignmentNotificationEmail({
        courseId: input.courseId,
        assignmentTitle: input.title.trim(),
        description: input.description.trim(),
        dueDateMillis: input.dueDate.toMillis(),
      });
    }
  } catch (err) {
    console.error(err);
  }

  return ref.id;
}

/**
 * Dispatches an automated assignment alert email to enrolled students
 * (with automatic fallback to all registered students if no students are enrolled in the course yet).
 */
export async function dispatchAssignmentNotificationEmail({
  courseId,
  assignmentTitle,
  description,
  dueDateMillis,
}: {
  courseId: string;
  assignmentTitle: string;
  description?: string;
  dueDateMillis?: number;
}): Promise<{ success: boolean; sentCount?: number; error?: string }> {
  try {
    const { fetchEnrollmentsForCourse } = await import("@/lib/services/enrollments");
    const { getUserProfile, fetchAllUsers } = await import("@/lib/services/users");

    let targetRecipients: Array<{ uid: string; name: string; email: string }> = [];

    try {
      const enrollments = await fetchEnrollmentsForCourse(courseId);
      if (enrollments && enrollments.length > 0) {
        const userProfiles = await Promise.all(
          enrollments.map((e) => getUserProfile(e.userId))
        );
        targetRecipients = userProfiles
          .filter((u): u is NonNullable<typeof u> => Boolean(u && u.email))
          .map((u) => ({ uid: u.uid, name: u.name || "Student", email: u.email }));
      }
    } catch (e) {
      console.warn("Could not fetch course enrollments:", e);
    }

    // Fallback: alert all registered students
    if (targetRecipients.length === 0) {
      try {
        const allUsers = await fetchAllUsers();
        targetRecipients = allUsers
          .filter((u) => Boolean(u.email) && u.role === "student")
          .map((u) => ({ uid: u.uid, name: u.name || "Student", email: u.email }));
      } catch (e) {
        console.warn("Could not fetch platform users:", e);
      }
    }

    const res = await fetch("/api/notifications/lifecycle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "new_assignment",
        courseId,
        assignmentTitle,
        description: description || "",
        dueDateMillis,
        recipients: targetRecipients,
      }),
    });

    const data = await res.json();
    return {
      success: res.ok,
      sentCount: data.sentCount || targetRecipients.length,
      error: data.error,
    };
  } catch (err: any) {
    console.error("Failed to dispatch assignment email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Editing an existing assignment is allowed even after completion — the count
 * of assignments doesn't change, so the 80% calc stays stable.
 */
export async function updateAssignment(
  id: string,
  input: Partial<AssignmentInput>
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) {
    patch.description = input.description.trim();
  }
  if (input.deliverables !== undefined) {
    patch.deliverables = input.deliverables
      .map((d) => d.trim())
      .filter((d) => d.length > 0);
  }
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate;
  if (Object.keys(patch).length === 0) return;
  await updateDoc(assignmentDoc(id), patch);
}

/** Raw delete. Cascade to that assignment's submissions is orchestrated by
 *  lib/services/cascade.ts (delivered in the admin group). */
export async function deleteAssignment(id: string): Promise<void> {
  await deleteDoc(assignmentDoc(id));
}

/** Admin-only: every assignment across all courses. */
export async function fetchAllAssignments(): Promise<Assignment[]> {
  const snap = await getDocs(assignmentsCol());
  return snap.docs.map((d) => mapAssignment(d.id, d.data()));
}