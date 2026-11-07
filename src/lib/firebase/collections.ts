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
  BLOG_POSTS: "blogPosts",
  EMAIL_BROADCASTS: "email_broadcasts",
  COURSE_PROGRESS: "courseProgress",
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

export const blogPostsCol = () => collection(db, COLLECTIONS.BLOG_POSTS);
export const blogPostDoc = (id: string) => doc(db, COLLECTIONS.BLOG_POSTS, id);

export const emailBroadcastsCol = () => collection(db, COLLECTIONS.EMAIL_BROADCASTS);
export const emailBroadcastDoc = (id: string) => doc(db, COLLECTIONS.EMAIL_BROADCASTS, id);

export const emailDeliveryLogsCol = () => collection(db, "emailDeliveryLogs");
export const emailDeliveryLogDoc = (id: string) => doc(db, "emailDeliveryLogs", id);

/** Deterministic ID — enforces one submission per student per assignment at the rules layer. */
export const submissionId = (assignmentId: string, userId: string) =>
  `${assignmentId}_${userId}`;

export const notificationsCol = (userId: string) =>
  collection(db, COLLECTIONS.NOTIFICATIONS, userId, "items");

export const notificationDoc = (userId: string, id: string) =>
  doc(db, COLLECTIONS.NOTIFICATIONS, userId, "items", id);

export const courseProgressCol = () => collection(db, COLLECTIONS.COURSE_PROGRESS);
export const courseProgressDoc = (id: string) =>
  doc(db, COLLECTIONS.COURSE_PROGRESS, id);
export const courseProgressId = (userId: string, courseId: string) =>
  `${userId}_${courseId}`;