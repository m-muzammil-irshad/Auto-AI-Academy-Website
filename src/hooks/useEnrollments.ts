"use client";

import { useCallback, useEffect, useState } from "react";
import {
  enrollInCourse,
  fetchEnrollmentsForUser,
} from "@/lib/services/enrollments";
import type { Enrollment } from "@/lib/types";

export interface UseEnrollmentsResult {
  enrollments: Enrollment[];
  courseIds: string[];
  loading: boolean;
  error: string;
  enroll: (courseId: string) => Promise<void>;
  isEnrolled: (courseId: string) => boolean;
}

export function useEnrollments(
  userId: string | null | undefined
): UseEnrollmentsResult {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!userId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const list = await fetchEnrollmentsForUser(userId);
      setEnrollments(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your enrollments."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const enroll = useCallback(
    async (courseId: string) => {
      if (!userId) throw new Error("You must be signed in to enroll.");
      await enrollInCourse(userId, courseId);
      await reload();
    },
    [userId, reload]
  );

  const isEnrolled = useCallback(
    (courseId: string) =>
      enrollments.some((e) => e.courseId === courseId),
    [enrollments]
  );

  return {
    enrollments,
    courseIds: enrollments.map((e) => e.courseId),
    loading,
    error,
    enroll,
    isEnrolled,
  };
}