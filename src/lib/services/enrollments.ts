import {
  Timestamp,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  enrollmentDoc,
  enrollmentsCol,
} from "@/lib/firebase/collections";
import { enrollmentsForUser } from "@/lib/firebase/queries";
import type { Enrollment } from "@/lib/types";

/** Deterministic ID — one enrollment per student per course. */
export function enrollmentIdFor(userId: string, courseId: string): string {
  return `${userId}_${courseId}`;
}

function mapEnrollment(id: string, data: Record<string, unknown>): Enrollment {
  return {
    id,
    userId: (data.userId as string) ?? "",
    courseId: (data.courseId as string) ?? "",
    enrolledAt: (data.enrolledAt as Timestamp) ?? Timestamp.now(),
  };
}

export async function fetchEnrollmentsForUser(
  userId: string
): Promise<Enrollment[]> {
  const snap = await getDocs(enrollmentsForUser(userId));
  return snap.docs.map((d) => mapEnrollment(d.id, d.data()));
}

export async function fetchEnrollment(
  userId: string,
  courseId: string
): Promise<Enrollment | null> {
  const snap = await getDoc(enrollmentDoc(enrollmentIdFor(userId, courseId)));
  if (!snap.exists()) return null;
  return mapEnrollment(snap.id, snap.data());
}

/** Idempotent — safe to call twice; second call is a no-op. */
export async function enrollInCourse(
  userId: string,
  courseId: string
): Promise<void> {
  const id = enrollmentIdFor(userId, courseId);
  const ref = enrollmentDoc(id);
  const existing = await getDoc(ref);
  if (existing.exists()) return;
  await setDoc(ref, {
    userId,
    courseId,
    enrolledAt: serverTimestamp(),
  });
}

/** Admin-side cascade helper (also called from cascade.ts). */
export async function deleteEnrollment(
  userId: string,
  courseId: string
): Promise<void> {
  await deleteDoc(enrollmentDoc(enrollmentIdFor(userId, courseId)));
}

/**
 * List of enrollments in a course — used by admin analytics.
 * Kept here so the enrollments collection has a single home for reads/writes.
 */
export async function fetchEnrollmentsForCourse(
  courseId: string
): Promise<Enrollment[]> {
  const { getDocs } = await import("firebase/firestore");
  const { enrollmentsForCourse } = await import("@/lib/firebase/queries");
  const snap = await getDocs(enrollmentsForCourse(courseId));
  return snap.docs.map((d) => mapEnrollment(d.id, d.data()));
}

/** Admin-only: every enrollment across all students. */
export async function fetchAllEnrollments(): Promise<Enrollment[]> {
  const snap = await getDocs(enrollmentsCol());
  return snap.docs.map((d) => mapEnrollment(d.id, d.data()));
}