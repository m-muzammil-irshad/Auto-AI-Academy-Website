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

const cachedEnrollments: Record<string, { data: Enrollment[]; time: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useEnrollments(
  userId: string | null | undefined
): UseEnrollmentsResult {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => 
    userId && cachedEnrollments[userId] ? cachedEnrollments[userId].data : []
  );
  const [loading, setLoading] = useState(() => 
    userId ? !cachedEnrollments[userId] : false
  );
  const [error, setError] = useState("");

  const reload = useCallback(async (background = false) => {
    if (!userId) {
      setEnrollments([]);
      setLoading(false);
      return;
    }
    
    if (!background) setLoading(true);
    setError("");
    try {
      const list = await fetchEnrollmentsForUser(userId);
      cachedEnrollments[userId] = { data: list, time: Date.now() };
      setEnrollments(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load your enrollments."
      );
    } finally {
      if (!background) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const cached = cachedEnrollments[userId];
    if (cached && Date.now() - cached.time < CACHE_DURATION) {
      setEnrollments(cached.data);
      setLoading(false);
      void reload(true); // background update
    } else {
      void reload(false);
    }
  }, [userId, reload]);

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