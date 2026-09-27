"use client";

import { useEffect, useState } from "react";
import { fetchCourses } from "@/lib/services/courses";
import type { Course } from "@/lib/types";

export interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string;
}

export function useCourses(max?: number): UseCoursesResult {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchCourses(max)
      .then((list) => {
        if (!cancelled) setCourses(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load courses."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [max]);

  return { courses, loading, error };
}