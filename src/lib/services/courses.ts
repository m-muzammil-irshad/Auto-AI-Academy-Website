import {
  Timestamp,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { courseDoc, coursesCol } from "@/lib/firebase/collections";
import { coursesByNewest } from "@/lib/firebase/queries";
import type { Course, CourseLevel, CourseStatus, Lesson } from "@/lib/types";

import { fetchAllUsers } from "@/lib/services/users";
import { pushNotification } from "@/lib/services/notifications";

export interface CourseInput {
  title: string;
  description: string;
  thumbnail: string;
  youtubeChannelUrl: string;
  outlineUrl?: string;
  level?: CourseLevel | "";
  duration?: string;
  lessonCount?: number | null;
  outcomes?: string[];
  lessons?: Lesson[];
  status: CourseStatus;
}

function mapCourse(id: string, data: Record<string, unknown>): Course {
  return {
    id,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    thumbnail: (data.thumbnail as string) ?? "",
    youtubeChannelUrl: (data.youtubeChannelUrl as string) ?? "",
    outlineUrl: (data.outlineUrl as string) ?? "",
    level: (data.level as CourseLevel | "") ?? "",
    duration: (data.duration as string) ?? "",
    lessonCount: (data.lessonCount as number | null) ?? null,
    outcomes: Array.isArray(data.outcomes) ? (data.outcomes as string[]) : [],
    lessons: Array.isArray(data.lessons) ? (data.lessons as Lesson[]) : [],
    status: (data.status as CourseStatus) ?? "soon",
    createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
    completedAt: (data.completedAt as Timestamp | null) ?? null,
  };
}

const singleCourseCache: Record<string, { course: Course; time: number }> = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export async function fetchCourses(max?: number): Promise<Course[]> {
  const snap = await getDocs(coursesByNewest(max));
  const list = snap.docs.map((d) => mapCourse(d.id, d.data()));
  for (const c of list) {
    singleCourseCache[c.id] = { course: c, time: Date.now() };
  }
  return list;
}

export async function fetchCourse(id: string): Promise<Course | null> {
  const cached = singleCourseCache[id];
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.course;
  }
  const snap = await getDoc(courseDoc(id));
  if (!snap.exists()) return null;
  const course = mapCourse(snap.id, snap.data());
  singleCourseCache[id] = { course, time: Date.now() };
  return course;
}

export async function createCourse(input: CourseInput): Promise<string> {
  const ref = await addDoc(coursesCol(), {
    title: input.title.trim(),
    description: input.description.trim(),
    thumbnail: input.thumbnail.trim(),
    youtubeChannelUrl: input.youtubeChannelUrl.trim(),
    outlineUrl: input.outlineUrl?.trim() ?? "",
    level: input.level ?? "",
    duration: input.duration?.trim() ?? "",
    lessonCount: input.lessonCount ?? null,
    outcomes: input.outcomes ?? [],
    lessons: input.lessons ?? [],
    status: input.status,
    createdAt: serverTimestamp(),
    completedAt: null,
  });

  try {
    const users = await fetchAllUsers();
    await Promise.allSettled(
      users.map((u) =>
        pushNotification({
          userId: u.uid,
          message: `New Course Available! 🚀 "${input.title.trim()}" has just been added.`,
          link: `/courses/${ref.id}`,
          type: "general",
        })
      )
    );

    // Trigger automated lifecycle email to all registered students
    if (typeof window !== "undefined") {
      fetch("/api/notifications/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ event: "new_course_published", courseId: ref.id }),
      }).catch((err) => console.error("New course email trigger error:", err));
    }
  } catch (err) {
    console.error("Failed to push notifications for new course", err);
  }

  return ref.id;
}

export async function updateCourse(
  id: string,
  input: Partial<CourseInput>
): Promise<void> {
  const oldCourse = await fetchCourse(id);
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim();
  if (input.thumbnail !== undefined) patch.thumbnail = input.thumbnail.trim();
  if (input.youtubeChannelUrl !== undefined) {
    patch.youtubeChannelUrl = input.youtubeChannelUrl.trim();
  }
  if (input.outlineUrl !== undefined) {
    patch.outlineUrl = input.outlineUrl.trim();
  }
  if (input.level !== undefined) patch.level = input.level;
  if (input.duration !== undefined) patch.duration = input.duration.trim();
  if (input.lessonCount !== undefined) patch.lessonCount = input.lessonCount;
  if (input.outcomes !== undefined) patch.outcomes = input.outcomes;
  if (input.lessons !== undefined) patch.lessons = input.lessons;
  if (input.status !== undefined) patch.status = input.status;
  if (Object.keys(patch).length === 0) return;
  await updateDoc(courseDoc(id), patch);
  delete singleCourseCache[id];

  if (oldCourse?.status === "soon" && input.status === "ongoing") {
    try {
      const users = await fetchAllUsers();
      await Promise.allSettled(
        users.map((u) =>
          pushNotification({
            userId: u.uid,
            message: `Enrollment is now OPEN for "${patch.title ?? oldCourse.title}"! 🎉`,
            link: `/courses/${id}`,
            type: "general",
          })
        )
      );

      // Trigger automated lifecycle email for course going ongoing
      if (typeof window !== "undefined") {
        fetch("/api/notifications/lifecycle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ event: "course_status_ongoing", courseId: id }),
        }).catch((err) => console.error("Course ongoing email trigger error:", err));
      }
    } catch (err) {
      console.error(err);
    }
  }
}

/** One-way action. Sets status to "completed" and stamps completedAt. */
export async function markCourseCompleted(id: string): Promise<void> {
  delete singleCourseCache[id];
  await updateDoc(courseDoc(id), {
    status: "completed",
    completedAt: serverTimestamp(),
  });
  
  try {
    const oldCourse = await fetchCourse(id);
    const { fetchEnrollmentsForCourse } = await import("@/lib/services/enrollments");
    const enrollments = await fetchEnrollmentsForCourse(id);
    await Promise.allSettled(
      enrollments.map((e) =>
        pushNotification({
          userId: e.userId,
          message: `The course "${oldCourse?.title ?? "A course"}" is now complete! 🎓`,
          link: `/courses/${id}`,
          type: "general",
        })
      )
    );

    // Trigger automated lifecycle email (Certificate eligible vs Catch-up needed)
    if (typeof window !== "undefined") {
      fetch("/api/notifications/lifecycle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ event: "course_completed", courseId: id }),
      }).catch((err) => console.error("Course completed email trigger error:", err));
    }
  } catch(err) {
    console.error(err);
  }
}

/** Raw delete. Cascade (enrollments → assignments → submissions) is orchestrated
 *  by lib/services/cascade.ts (delivered in the admin group). */
export async function deleteCourse(id: string): Promise<void> {
  delete singleCourseCache[id];
  await deleteDoc(courseDoc(id));
}