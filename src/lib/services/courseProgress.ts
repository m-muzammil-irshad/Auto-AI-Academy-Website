import {
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { courseProgressDoc, courseProgressId } from "@/lib/firebase/collections";
import type { UserCourseProgress } from "@/lib/types";

function getStorageKey(userId: string, courseId: string): string {
  return `course_progress_${userId}_${courseId}`;
}

export async function fetchCourseProgress(
  userId: string,
  courseId: string
): Promise<UserCourseProgress | null> {
  if (!userId || !courseId) return null;
  const storageKey = getStorageKey(userId, courseId);

  // 1. Try reading from Firestore
  try {
    const id = courseProgressId(userId, courseId);
    const snap = await getDoc(courseProgressDoc(id));
    if (snap.exists()) {
      const data = snap.data();
      const progress: UserCourseProgress = {
        id,
        userId: (data.userId as string) ?? userId,
        courseId: (data.courseId as string) ?? courseId,
        currentLessonId: (data.currentLessonId as string) ?? "",
        lastTimestampSeconds: (data.lastTimestampSeconds as number) ?? 0,
        completedLessonIds: Array.isArray(data.completedLessonIds)
          ? (data.completedLessonIds as string[])
          : [],
        lastWatchedAt: (data.lastWatchedAt as Timestamp) ?? null,
        updatedAt: (data.updatedAt as Timestamp) ?? null,
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(progress));
        } catch {}
      }

      return progress;
    }
  } catch (err) {
    // If permission denied (e.g. security rules not yet deployed or doc not found), log and fallback
    console.warn("Could not read Firestore progress, falling back to local storage:", err);
  }

  // 2. Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
  }

  return null;
}

export async function saveCourseProgress(
  userId: string,
  courseId: string,
  currentLessonId: string,
  lastTimestampSeconds: number
): Promise<void> {
  if (!userId || !courseId) return;
  const storageKey = getStorageKey(userId, courseId);

  // 1. Always save to localStorage immediately for instant offline/permission resilience
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem(storageKey);
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...parsed,
          userId,
          courseId,
          currentLessonId,
          lastTimestampSeconds: Math.floor(lastTimestampSeconds),
        })
      );
    } catch {}
  }

  // 2. Attempt Firestore sync
  try {
    const id = courseProgressId(userId, courseId);
    const ref = courseProgressDoc(id);

    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        userId,
        courseId,
        currentLessonId,
        lastTimestampSeconds: Math.floor(lastTimestampSeconds),
        completedLessonIds: [],
        lastWatchedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        currentLessonId,
        lastTimestampSeconds: Math.floor(lastTimestampSeconds),
        lastWatchedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn("Could not sync course progress to Firestore:", err);
  }
}

export async function toggleLessonCompleted(
  userId: string,
  courseId: string,
  lessonId: string,
  completed: boolean
): Promise<string[]> {
  if (!userId || !courseId || !lessonId) return [];
  const storageKey = getStorageKey(userId, courseId);

  // Get current list from localStorage first as backup
  let currentList: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.completedLessonIds)) {
          currentList = parsed.completedLessonIds;
        }
      }
    } catch {}
  }

  // Update list
  let updatedList: string[];
  if (completed) {
    updatedList = Array.from(new Set([...currentList, lessonId]));
  } else {
    updatedList = currentList.filter((id) => id !== lessonId);
  }

  // Save to localStorage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(storageKey);
      const parsed = cached ? JSON.parse(cached) : {};
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...parsed,
          userId,
          courseId,
          completedLessonIds: updatedList,
        })
      );
    } catch {}
  }

  // Attempt Firestore sync
  try {
    const id = courseProgressId(userId, courseId);
    const ref = courseProgressDoc(id);

    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        userId,
        courseId,
        currentLessonId: lessonId,
        lastTimestampSeconds: 0,
        completedLessonIds: updatedList,
        lastWatchedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        completedLessonIds: updatedList,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn("Could not sync lesson completion to Firestore:", err);
  }

  return updatedList;
}
