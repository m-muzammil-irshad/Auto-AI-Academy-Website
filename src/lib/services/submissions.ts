import {
  Timestamp,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  submissionDoc,
  submissionId,
  submissionsCol,
  userDoc,
} from "@/lib/firebase/collections";
import {
  submissionsForAssignment,
  submissionsForUser,
} from "@/lib/firebase/queries";
import { pushNotification } from "@/lib/services/notifications";
import type { Grading, Submission } from "@/lib/types";
import { monthKey } from "@/lib/utils/dates";

export interface SubmitInput {
  assignmentId: string;
  userId: string;
  studentName: string;
  driveLink: string;
  description: string;
  isLate: boolean;
}

function mapSubmission(
  id: string,
  data: Record<string, unknown>
): Submission {
  const rawGrading = data.grading as Record<string, unknown> | null | undefined;
  const grading: Grading | null = rawGrading
    ? {
        correctness: (rawGrading.correctness as number) ?? 0,
        creativity: (rawGrading.creativity as number) ?? 0,
        timeliness: (rawGrading.timeliness as number) ?? 0,
        finalStars: (rawGrading.finalStars as number) ?? 0,
      }
    : null;
  return {
    id,
    assignmentId: (data.assignmentId as string) ?? "",
    userId: (data.userId as string) ?? "",
    studentName: (data.studentName as string) ?? "",
    driveLink: (data.driveLink as string) ?? "",
    description: (data.description as string) ?? "",
    submittedAt: (data.submittedAt as Timestamp) ?? Timestamp.now(),
    isLate: !!data.isLate,
    locked: !!data.locked,
    grading,
    gradedAt: (data.gradedAt as Timestamp | null) ?? null,
  };
}

/**
 * Deterministic doc ID = `{assignmentId}_{userId}`.
 * The security rule for submissions uses this to enforce
 * "one submission per student per assignment" with a single exists() check.
 */
export async function submitAssignment(input: SubmitInput): Promise<void> {
  const id = submissionId(input.assignmentId, input.userId);
  const ref = submissionDoc(id);

  const existing = await getDoc(ref);
  if (existing.exists()) {
    throw new Error(
      "You have already submitted this assignment."
    );
  }

  await setDoc(ref, {
    assignmentId: input.assignmentId,
    userId: input.userId,
    studentName: input.studentName,
    driveLink: input.driveLink.trim(),
    description: input.description.trim(),
    submittedAt: serverTimestamp(),
    isLate: input.isLate,
    locked: true,
    grading: null,
    gradedAt: null,
  });
}

export async function fetchSubmissionsForUser(
  userId: string
): Promise<Submission[]> {
  const snap = await getDocs(submissionsForUser(userId));
  return snap.docs
    .map((d) => mapSubmission(d.id, d.data()))
    .sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
}

export async function fetchSubmission(
  assignmentId: string,
  userId: string
): Promise<Submission | null> {
  const snap = await getDoc(submissionDoc(submissionId(assignmentId, userId)));
  if (!snap.exists()) return null;
  return mapSubmission(snap.id, snap.data());
}

/** All submissions for one assignment — used by admin grading list. */
export async function fetchSubmissionsForAssignment(
  assignmentId: string
): Promise<Submission[]> {
  const snap = await getDocs(submissionsForAssignment(assignmentId));
  return snap.docs.map((d) => mapSubmission(d.id, d.data()));
}

/**
 * Grade a submission end-to-end (spec 8.4):
 *   1. Save grading + gradedAt on the submission.
 *   2. Update the student's monthlyStars[YYYY-MM] + all-time counters,
 *      applying only the DELTA so re-grading never double-counts.
 *   3. Push a "graded" notification (only on the first grade).
 *
 * Leaderboard reads pull these counters directly, so no cron/reset is needed.
 */
export async function gradeSubmission(params: {
  submissionId: string;
  userId: string;
  grading: Grading;
  assignmentTitle: string;
}): Promise<void> {
  const ref = submissionDoc(params.submissionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Submission not found.");
  }

  const existing = snap.data() as Record<string, unknown>;
  const oldGrading = existing.grading as Grading | null | undefined;
  const wasGraded = !!oldGrading;

  const oldStars = wasGraded ? oldGrading!.finalStars : 0;
  const delta = params.grading.finalStars - oldStars;
  const countDelta = wasGraded ? 0 : 1;

  // 1. Save the submission's grade.
  await updateDoc(ref, {
    grading: params.grading,
    gradedAt: serverTimestamp(),
  });

  // 2. Update the student's counters.
  const mKey = monthKey();
  await updateDoc(userDoc(params.userId), {
    [`monthlyStars.${mKey}.totalStars`]: increment(delta),
    [`monthlyStars.${mKey}.submissionCount`]: increment(countDelta),
    allTimeStars: increment(delta),
    allTimeSubmissionCount: increment(countDelta),
  });

  // 3. Notify the student on their first grade only.
  if (!wasGraded) {
    await pushNotification({
      userId: params.userId,
      type: "grading",
      message: `You were graded on "${params.assignmentTitle}" — ${params.grading.finalStars.toFixed(1)} ★`,
    });
  }
}

/** Raw delete — used by cascade.ts when an assignment or course is removed,
 *  and by the Settings prune action. */
export async function deleteSubmission(id: string): Promise<void> {
  const { deleteDoc } = await import("firebase/firestore");
  await deleteDoc(submissionDoc(id));
}

/** Admin-only: every submission across all students. */
export async function fetchAllSubmissions(): Promise<Submission[]> {
  const snap = await getDocs(submissionsCol());
  return snap.docs.map((d) => mapSubmission(d.id, d.data()));
}