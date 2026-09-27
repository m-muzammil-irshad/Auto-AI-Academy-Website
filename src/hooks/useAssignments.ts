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
export function useAssignments(
  courseIds: string[]
): UseAssignmentsResult {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const key = [...courseIds].sort().join("|");

  useEffect(() => {
    let cancelled = false;
    const ids = key.length > 0 ? key.split("|") : [];
    if (ids.length === 0) {
      setAssignments([]);
      setLoading(false);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    fetchAssignmentsForCourses(ids)
      .then((list) => {
        if (!cancelled) setAssignments(list);
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