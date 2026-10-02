"use client";

import { useEffect, useState } from "react";
import { fetchCourses } from "@/lib/services/courses";
import type { Course } from "@/lib/types";

export interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string;
}

let cachedCourses: Course[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useCourses(max?: number): UseCoursesResult {
  const [courses, setCourses] = useState<Course[]>(cachedCourses || []);
  const [loading, setLoading] = useState(!cachedCourses);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    
    // If we have cached courses and they are fresh, skip loading state
    if (cachedCourses && now - lastFetchTime < CACHE_DURATION && !max) {
      setCourses(cachedCourses);
      setLoading(false);
      // Fetch in background to keep cache fresh
      fetchCourses(max).then((list) => {
        if (!cancelled) {
          cachedCourses = list;
          lastFetchTime = Date.now();
          setCourses(list);
        }
      }).catch(console.error);
      return;
    }

    if (!cachedCourses) setLoading(true);
    setError("");
    
    fetchCourses(max)
      .then((list) => {
        if (!cancelled) {
          if (!max) {
            cachedCourses = list;
            lastFetchTime = Date.now();
          }
          setCourses(list);
        }
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