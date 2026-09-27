"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSubmissionsForUser } from "@/lib/services/submissions";
import type { Submission } from "@/lib/types";

export interface UseSubmissionsResult {
  submissions: Submission[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  byAssignment: (assignmentId: string) => Submission | undefined;
}

export function useSubmissions(
  userId: string | null | undefined
): UseSubmissionsResult {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!userId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const list = await fetchSubmissionsForUser(userId);
      setSubmissions(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load submissions."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const byAssignment = useCallback(
    (assignmentId: string) =>
      submissions.find((s) => s.assignmentId === assignmentId),
    [submissions]
  );

  return { submissions, loading, error, reload, byAssignment };
}