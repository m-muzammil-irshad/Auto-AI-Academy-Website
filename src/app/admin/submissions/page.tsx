"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { SubmissionTable } from "@/components/admin/SubmissionTable";
import {
  fetchAllSubmissions,
  gradeSubmission,
} from "@/lib/services/submissions";
import { fetchAllAssignments } from "@/lib/services/assignments";
import { fetchCourses } from "@/lib/services/courses";
import type {
  Assignment,
  Course,
  Grading,
  Submission,
} from "@/lib/types";

const ALL = "__all__";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [courseFilter, setCourseFilter] = useState<string>(ALL);
  const [assignmentFilter, setAssignmentFilter] = useState<string>(ALL);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, a, c] = await Promise.all([
        fetchAllSubmissions(),
        fetchAllAssignments(),
        fetchCourses(),
      ]);
      setSubmissions(s);
      setAssignments(a);
      setCourses(c);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load submissions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const courseById = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) map.set(c.id, c);
    return map;
  }, [courses]);

  const assignmentById = useMemo(() => {
    const map = new Map<string, Assignment>();
    for (const a of assignments) map.set(a.id, a);
    return map;
  }, [assignments]);

  const assignmentsForCourse = useMemo(() => {
    if (courseFilter === ALL) return assignments;
    return assignments.filter((a) => a.courseId === courseFilter);
  }, [assignments, courseFilter]);

  const filtered = useMemo(() => {
    return submissions
      .filter((s) => {
        const a = assignmentById.get(s.assignmentId);
        if (!a) return false;
        if (courseFilter !== ALL && a.courseId !== courseFilter) return false;
        if (assignmentFilter !== ALL && s.assignmentId !== assignmentFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis());
  }, [submissions, assignmentById, courseFilter, assignmentFilter]);

  const courseOptions = useMemo(
    () => [
      { value: ALL, label: "All courses" },
      ...courses.map((c) => ({ value: c.id, label: c.title })),
    ],
    [courses]
  );

  const assignmentOptions = useMemo(
    () => [
      { value: ALL, label: "All assignments" },
      ...assignmentsForCourse.map((a) => ({ value: a.id, label: a.title })),
    ],
    [assignmentsForCourse]
  );

  async function handleGrade(submission: Submission, grading: Grading) {
    const assignment = assignmentById.get(submission.assignmentId);
    await gradeSubmission({
      submissionId: submission.id,
      userId: submission.userId,
      grading,
      assignmentTitle: assignment?.title ?? "Assignment",
    });
    // Update local state so the row reflects the new grade immediately.
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submission.id
          ? { ...s, grading, gradedAt: s.gradedAt ?? null }
          : s
      )
    );
  }

  function handleCourseChange(v: string) {
    setCourseFilter(v);
    setAssignmentFilter(ALL);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Submissions & Grading
        </h1>
        <p className="mt-1 text-slate-600">
          Review submissions and grade them on correctness, creativity, and
          timeliness.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Course"
          value={courseFilter}
          onChange={(e) => handleCourseChange(e.target.value)}
          options={courseOptions}
        />
        <Select
          label="Assignment"
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value)}
          options={assignmentOptions}
        />
      </div>

      {error && (
        <EmptyState title="Could not load submissions" description={error} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <Skeleton className="mb-2 h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No submissions to grade yet"
          description={
            submissions.length === 0
              ? "Once students submit assignments, they’ll appear here."
              : "No submissions match the current filters."
          }
        />
      ) : (
        <SubmissionTable
          submissions={filtered}
          courseById={courseById}
          assignmentById={assignmentById}
          onGrade={handleGrade}
        />
      )}
    </div>
  );
}