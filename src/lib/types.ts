import { Timestamp } from "firebase/firestore";

export type UserRole = "student" | "admin";
export type CourseStatus = "ongoing" | "soon" | "completed";
export type NotificationType =
  | "grading"
  | "new_assignment"
  | "new_course"
  | "general";

export interface MonthlyStars {
  totalStars: number;
  submissionCount: number;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  createdAt: Timestamp;
  role: UserRole;
  monthlyStars: Record<string, MonthlyStars>;
  allTimeStars: number;
  allTimeSubmissionCount: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  youtubeChannelUrl: string;
  status: CourseStatus;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Timestamp;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deliverables: string[];
  dueDate: Timestamp;
  createdAt: Timestamp;
}

export interface Grading {
  correctness: number;
  creativity: number;
  timeliness: number;
  finalStars: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  studentName: string;
  driveLink: string;
  description: string;
  submittedAt: Timestamp;
  isLate: boolean;
  locked: boolean;
  grading: Grading | null;
  gradedAt: Timestamp | null;
}

export interface AppNotification {
  id: string;
  message: string;
  type: NotificationType;
  createdAt: Timestamp;
  read: boolean;
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  totalStars: number;
  submissionCount: number;
  rank: number;
}