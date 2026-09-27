import {
  DocumentReference,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import {
  assignmentDoc,
  courseDoc,
  enrollmentsCol,
  submissionsCol,
} from "@/lib/firebase/collections";
import {
  assignmentsForCourse,
  enrollmentsForCourse,
  submissionsForAssignment,
} from "@/lib/firebase/queries";

const BATCH_LIMIT = 450; // Firestore caps at 500; leave headroom.

async function deleteRefsInChunks(
  refs: DocumentReference[]
): Promise<void> {
  for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
    const slice = refs.slice(i, i + BATCH_LIMIT);
    if (slice.length === 0) continue;
    const batch = writeBatch(slice[0].firestore);
    for (const ref of slice) batch.delete(ref);
    await batch.commit();
  }
}

/**
 * Cascade delete for a course:
 *   course → its enrollments → its assignments → those assignments' submissions
 * Any dangling notifications become stale and are ignored by the UI.
 */
export async function deleteCourseCascade(courseId: string): Promise<void> {
  const assignmentsSnap = await getDocs(assignmentsForCourse(courseId));
  const enrollmentsSnap = await getDocs(enrollmentsForCourse(courseId));

  const submissionRefs: DocumentReference[] = [];
  for (const d of assignmentsSnap.docs) {
    const snap = await getDocs(submissionsForAssignment(d.id));
    for (const s of snap.docs) submissionRefs.push(s.ref);
  }

  const refs: DocumentReference[] = [
    ...assignmentsSnap.docs.map((d) => d.ref),
    ...enrollmentsSnap.docs.map((d) => d.ref),
    ...submissionRefs,
  ];

  await deleteRefsInChunks(refs);
  await deleteRefsInChunks([courseDoc(courseId)]);
}

/**
 * Cascade delete for an assignment:
 *   assignment → its submissions
 * The course and any other assignments are untouched.
 */
export async function deleteAssignmentCascade(
  assignmentId: string
): Promise<void> {
  const submissionsSnap = await getDocs(
    submissionsForAssignment(assignmentId)
  );
  const refs: DocumentReference[] = [
    ...submissionsSnap.docs.map((d) => d.ref),
    assignmentDoc(assignmentId),
  ];
  await deleteRefsInChunks(refs);
}

/** Hard delete every submission in the given ref list — used by Settings prune. */
export async function pruneSubmissions(
  submissionRefs: DocumentReference[]
): Promise<void> {
  await deleteRefsInChunks(submissionRefs);
}

/** All submission refs in the collection — used by Settings prune enumeration. */
export async function getAllSubmissionRefs(): Promise<DocumentReference[]> {
  const snap = await getDocs(submissionsCol());
  return snap.docs.map((d) => d.ref);
}

/** Kept for symmetry — not used by any current screen. */
export async function getAllEnrollmentRefs(): Promise<DocumentReference[]> {
  const snap = await getDocs(enrollmentsCol());
  return snap.docs.map((d) => d.ref);
}