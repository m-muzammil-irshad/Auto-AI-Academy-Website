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

const cachedSubmissions: Record<string, { data: Submission[]; time: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export function useSubmissions(
  userId: string | null | undefined
): UseSubmissionsResult {
  const [submissions, setSubmissions] = useState<Submission[]>(() => 
    userId && cachedSubmissions[userId] ? cachedSubmissions[userId].data : []
  );
  const [loading, setLoading] = useState(() => 
    userId ? !cachedSubmissions[userId] : false
  );
  const [error, setError] = useState("");

  const reload = useCallback(async (background = false) => {
    if (!userId) {
      setSubmissions([]);
      setLoading(false);
      return;
    }
    
    if (!background) setLoading(true);
    setError("");
    try {
      const list = await fetchSubmissionsForUser(userId);
      cachedSubmissions[userId] = { data: list, time: Date.now() };
      setSubmissions(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load submissions."
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
    
    const cached = cachedSubmissions[userId];
    if (cached && Date.now() - cached.time < CACHE_DURATION) {
      setSubmissions(cached.data);
      setLoading(false);
      void reload(true); // background update
    } else {
      void reload(false);
    }
  }, [userId, reload]);

  const byAssignment = useCallback(
    (assignmentId: string) =>
      submissions.find((s) => s.assignmentId === assignmentId),
    [submissions]
  );

  return { submissions, loading, error, reload, byAssignment };
}