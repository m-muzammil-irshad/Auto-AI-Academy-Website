"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAssignments } from "@/hooks/useAssignments";
import { useSubmissions } from "@/hooks/useSubmissions";
import type { Assignment, Course, Submission } from "@/lib/types";

export interface CertificateStatus {
  course: Course;
  totalAssignments: number;
  submittedCount: number;
  percent: number;
  eligible: boolean;
  reason: string | null;
}

export interface UseCertificateEligibilityResult {
  statuses: CertificateStatus[];
  loading: boolean;
  error: string;
}

const THRESHOLD = 0.8;

/**
 * Per-course eligibility:
 *   course.status === "completed" AND submitted / total >= 0.8
 *
 * Edge cases:
 *   - 0 assignments in a completed course → NOT eligible (nothing verifiable).
 *   - course not yet completed → reason points to the admin action.
 *   - below threshold → reason points to the exact count needed.
 */
export function useCertificateEligibility(): UseCertificateEligibilityResult {
  const { user } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError } =
    useCourses();
  const { courseIds, loading: enrollLoading, error: enrollError } =
    useEnrollments(user?.uid);
  const { assignments, loading: assignLoading } =
    useAssignments(courseIds);
  const { submissions, loading: subsLoading } = useSubmissions(user?.uid);

  const loading =
    coursesLoading || enrollLoading || assignLoading || subsLoading;
  const error = coursesError || enrollError;

  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (!loading) setSettled(true);
  }, [loading]);

  const statuses = useMemo<CertificateStatus[]>(() => {
    if (loading) return [];

    const enrolledSet = new Set(courseIds);
    const enrolledCourses = courses.filter((c) => enrolledSet.has(c.id));

    const assignmentsByCourse = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const list = assignmentsByCourse.get(a.courseId) ?? [];
      list.push(a);
      assignmentsByCourse.set(a.courseId, list);
    }

    const submittedIds = new Set<string>(
      submissions.map((s: Submission) => s.assignmentId)
    );

    return enrolledCourses.map<CertificateStatus>((course) => {
      const courseAssignments = assignmentsByCourse.get(course.id) ?? [];
      const totalAssignments = courseAssignments.length;
      const submittedCount = courseAssignments.filter((a) =>
        submittedIds.has(a.id)
      ).length;
      const percent =
        totalAssignments > 0 ? submittedCount / totalAssignments : 0;

      if (course.status !== "completed") {
        return {
          course,
          totalAssignments,
          submittedCount,
          percent,
          eligible: false,
          reason:
            "This course isn’t marked completed yet by the admin.",
        };
      }

      if (totalAssignments === 0) {
        return {
          course,
          totalAssignments,
          submittedCount,
          percent,
          eligible: false,
          reason:
            "This course has no assignments, so the 80% requirement cannot be verified. Contact the admin.",
        };
      }

      if (percent < THRESHOLD) {
        const needed = Math.ceil(THRESHOLD * totalAssignments);
        return {
          course,
          totalAssignments,
          submittedCount,
          percent,
          eligible: false,
          reason: `Submit at least ${needed} of ${totalAssignments} assignments to become eligible (you’ve submitted ${submittedCount}).`,
        };
      }

      return {
        course,
        totalAssignments,
        submittedCount,
        percent,
        eligible: true,
        reason: null,
      };
    });
  }, [loading, courses, courseIds, assignments, submissions]);

  return {
    statuses,
    loading: loading || !settled,
    error,
  };
}