"use client";

import { useEffect, useState } from "react";
import { fetchAssignmentsForCourses } from "@/lib/services/assignments";
import type { Assignment } from "@/lib/types";

export interface UseAssignmentsResult {
  assignments: Assignment[];
  loading: boolean;
  error: string;
}

/**
 * Pass a stable list of courseIds (e.g. from useEnrollments().courseIds).
 * The hook re-fetches whenever the *content* changes, not when a new
 * array reference with identical contents is passed.
 */
const cachedAssignments: Record<string, { data: Assignment[]; time: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useAssignments(
  courseIds: string[]
): UseAssignmentsResult {
  const key = [...courseIds].sort().join("|");
  
  const [assignments, setAssignments] = useState<Assignment[]>(() => 
    key && cachedAssignments[key] ? cachedAssignments[key].data : []
  );
  const [loading, setLoading] = useState(() => 
    key && key.length > 0 ? !cachedAssignments[key] : false
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const ids = key.length > 0 ? key.split("|") : [];
    if (ids.length === 0) {
      setAssignments([]);
      setLoading(false);
      setError("");
      return;
    }
    
    const cached = cachedAssignments[key];
    const isFresh = cached && Date.now() - cached.time < CACHE_DURATION;
    
    if (isFresh) {
      setAssignments(cached.data);
      setLoading(false);
      // Fetch in background
      fetchAssignmentsForCourses(ids).then((list) => {
        if (!cancelled) {
          cachedAssignments[key] = { data: list, time: Date.now() };
          setAssignments(list);
        }
      }).catch(console.error);
      return;
    }

    setLoading(true);
    setError("");
    
    fetchAssignmentsForCourses(ids)
      .then((list) => {
        if (!cancelled) {
          cachedAssignments[key] = { data: list, time: Date.now() };
          setAssignments(list);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load assignments."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
      
    return () => {
      cancelled = true;
    };
  }, [key]);

  return { assignments, loading, error };
}