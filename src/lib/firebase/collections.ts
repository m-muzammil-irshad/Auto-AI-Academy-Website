import {
  DocumentReference,
  collection,
  doc,
} from "firebase/firestore";
import { db } from "./config";

export const COLLECTIONS = {
  USERS: "users",
  COURSES: "courses",
  ENROLLMENTS: "enrollments",
  ASSIGNMENTS: "assignments",
  SUBMISSIONS: "submissions",
  NOTIFICATIONS: "notifications",
} as const;

export const usersCol = () => collection(db, COLLECTIONS.USERS);
export const userDoc = (uid: string): DocumentReference =>
  doc(db, COLLECTIONS.USERS, uid);

export const coursesCol = () => collection(db, COLLECTIONS.COURSES);
export const courseDoc = (id: string) => doc(db, COLLECTIONS.COURSES, id);

export const enrollmentsCol = () => collection(db, COLLECTIONS.ENROLLMENTS);
export const enrollmentDoc = (id: string) =>
  doc(db, COLLECTIONS.ENROLLMENTS, id);

export const assignmentsCol = () => collection(db, COLLECTIONS.ASSIGNMENTS);
export const assignmentDoc = (id: string) =>
  doc(db, COLLECTIONS.ASSIGNMENTS, id);

export const submissionsCol = () => collection(db, COLLECTIONS.SUBMISSIONS);
export const submissionDoc = (id: string) =>
  doc(db, COLLECTIONS.SUBMISSIONS, id);

/** Deterministic ID — enforces one submission per student per assignment at the rules layer. */
export const submissionId = (assignmentId: string, userId: string) =>
  `${assignmentId}_${userId}`;

export const notificationsCol = (userId: string) =>
  collection(db, COLLECTIONS.NOTIFICATIONS, userId, "items");

export const notificationDoc = (userId: string, id: string) =>
  doc(db, COLLECTIONS.NOTIFICATIONS, userId, "items", id);