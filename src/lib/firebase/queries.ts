import {
  Query,
  QueryConstraint,
  collection,
  limit as fbLimit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { COLLECTIONS } from "./collections";

/**
 * Reusable Firestore query builders.
 * Only single-field indexes are used â€” no composite indexes required.
 * Any secondary sorting (e.g. by dueDate within a course) is done client-side
 * in the consuming service to avoid composite index setup on the free tier.
 */

export function coursesByNewest(max?: number): Query {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (typeof max === "number") constraints.push(fbLimit(max));
  return query(collection(db, COLLECTIONS.COURSES), ...constraints);
}

export function assignmentsForCourse(courseId: string): Query {
  return query(
    collection(db, COLLECTIONS.ASSIGNMENTS),
    where("courseId", "==", courseId)
  );
}

export function enrollmentsForUser(userId: string): Query {
  return query(
    collection(db, COLLECTIONS.ENROLLMENTS),
    where("userId", "==", userId)
  );
}

export function enrollmentsForCourse(courseId: string): Query {
  return query(
    collection(db, COLLECTIONS.ENROLLMENTS),
    where("courseId", "==", courseId)
  );
}

export function submissionsForUser(userId: string): Query {
  return query(
    collection(db, COLLECTIONS.SUBMISSIONS),
    where("userId", "==", userId)
  );
}

export function submissionsForAssignment(assignmentId: string): Query {
  return query(
    collection(db, COLLECTIONS.SUBMISSIONS),
    where("assignmentId", "==", assignmentId)
  );
}

/** Any user who has ever earned a star â€” candidates for both leaderboards. */
export function leaderboardCandidates(): Query {
  return query(
    collection(db, COLLECTIONS.USERS),
    where("allTimeSubmissionCount", ">", 0)
  );
}