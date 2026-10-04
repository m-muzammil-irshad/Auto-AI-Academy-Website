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
import type { Course, CourseStatus } from "@/lib/types";

import { fetchAllUsers } from "@/lib/services/users";
import { pushNotification } from "@/lib/services/notifications";

export interface CourseInput {
  title: string;
  description: string;
  thumbnail: string;
  youtubeChannelUrl: string;
  outlineUrl?: string;
  status: Extract<CourseStatus, "ongoing" | "soon">;
}

function mapCourse(id: string, data: Record<string, unknown>): Course {
  return {
    id,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    thumbnail: (data.thumbnail as string) ?? "",
    youtubeChannelUrl: (data.youtubeChannelUrl as string) ?? "",
    outlineUrl: (data.outlineUrl as string) ?? "",
    status: (data.status as CourseStatus) ?? "soon",
    createdAt: (data.createdAt as Timestamp) ?? Timestamp.now(),
    completedAt: (data.completedAt as Timestamp | null) ?? null,
  };
}

export async function fetchCourses(max?: number): Promise<Course[]> {
  const snap = await getDocs(coursesByNewest(max));
  return snap.docs.map((d) => mapCourse(d.id, d.data()));
}

export async function fetchCourse(id: string): Promise<Course | null> {
  const snap = await getDoc(courseDoc(id));
  if (!snap.exists()) return null;
  return mapCourse(snap.id, snap.data());
}

export async function createCourse(input: CourseInput): Promise<string> {
  const ref = await addDoc(coursesCol(), {
    title: input.title.trim(),
    description: input.description.trim(),
    thumbnail: input.thumbnail.trim(),
    youtubeChannelUrl: input.youtubeChannelUrl.trim(),
    outlineUrl: input.outlineUrl?.trim() ?? "",
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
  if (input.status !== undefined) patch.status = input.status;
  if (Object.keys(patch).length === 0) return;
  await updateDoc(courseDoc(id), patch);

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
    } catch (err) {
      console.error(err);
    }
  }
}

/** One-way action. Sets status to "completed" and stamps completedAt. */
export async function markCourseCompleted(id: string): Promise<void> {
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
  } catch(err) {
    console.error(err);
  }
}

/** Raw delete. Cascade (enrollments → assignments → submissions) is orchestrated
 *  by lib/services/cascade.ts (delivered in the admin group). */
export async function deleteCourse(id: string): Promise<void> {
  await deleteDoc(courseDoc(id));
}