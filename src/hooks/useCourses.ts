"use client";

import { useEffect, useState } from "react";
import { fetchCourses } from "@/lib/services/courses";
import type { Course } from "@/lib/types";

export interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string;
}

const CACHE_DURATION = 1000 * 60 * 10; // 10 minutes
const cacheMap: Record<string, { list: Course[]; time: number }> = {};

function getInitialCourses(max?: number): Course[] {
  const key = max ? `max_${max}` : "all";
  if (cacheMap[key]) return cacheMap[key].list;
  if (cacheMap["all"]) {
    return max ? cacheMap["all"].list.slice(0, max) : cacheMap["all"].list;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`aaa_courses_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        cacheMap[key] = { list: parsed, time: Date.now() };
        return parsed;
      }
    } catch {
      // ignore storage errors
    }
  }
  return [];
}

export function useCourses(max?: number, initialCourses?: Course[]): UseCoursesResult {
  const key = max ? `max_${max}` : "all";
  const [courses, setCourses] = useState<Course[]>(() => {
    const cached = getInitialCourses(max);
    if (cached.length > 0) return cached;
    if (initialCourses && initialCourses.length > 0) return initialCourses;
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getInitialCourses(max);
    if (cached.length > 0) return false;
    if (initialCourses && initialCourses.length > 0) return false;
    return true;
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const now = Date.now();
    const cached = cacheMap[key];

    // If cache is still fresh, serve from cache and fetch quietly in background if older than 2 minutes
    if (cached && now - cached.time < CACHE_DURATION) {
      setCourses(cached.list);
      setLoading(false);
      if (now - cached.time < 1000 * 60 * 2) {
        return; // completely fresh, skip background fetch
      }
    }

    if (courses.length === 0) {
      setLoading(true);
    }
    setError("");

    fetchCourses(max)
      .then((list) => {
        if (!cancelled) {
          cacheMap[key] = { list, time: Date.now() };
          if (!max) {
            cacheMap["all"] = { list, time: Date.now() };
          }
          if (typeof window !== "undefined") {
            try {
              sessionStorage.setItem(`aaa_courses_${key}`, JSON.stringify(list));
            } catch {
              // ignore
            }
          }
          setCourses(list);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && courses.length === 0) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max, key]);

  return { courses, loading, error };
}