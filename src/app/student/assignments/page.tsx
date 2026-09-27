"use client";

import { useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAssignments } from "@/hooks/useAssignments";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useCourses } from "@/hooks/useCourses";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { submitAssignment } from "@/lib/services/submissions";

export default function StudentAssignmentsPage() {
  const { user, profile } = useAuth();
  const { courseIds, loading: enrollLoading } = useEnrollments(user?.uid);
  const { assignments, loading: assignLoading, error: assignError } =
    useAssignments(courseIds);
  const { submissions, loading: subsLoading, reload } = useSubmissions(
    user?.uid
  );
  const { courses, loading: coursesLoading } = useCourses();

  const loading = enrollLoading || assignLoading || subsLoading || coursesLoading;

  const courseTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of courses) map.set(c.id, c.title);
    return map;
  }, [courses]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof assignments>();
    for (const a of assignments) {
      const list = map.get(a.courseId) ?? [];
      list.push(a);
      map.set(a.courseId, list);
    }
    return Array.from(map.entries()).map(([courseId, list]) => ({
      courseId,
      courseTitle: courseTitleById.get(courseId) ?? "Course",
      list: [...list].sort(
        (a, b) => a.dueDate.toMillis() - b.dueDate.toMillis()
      ),
    }));
  }, [assignments, courseTitleById]);

  const submissionByAssignmentId = useMemo(() => {
    const map = new Map<string, (typeof submissions)[number]>();
    for (const s of submissions) map.set(s.assignmentId, s);
    return map;
  }, [submissions]);

  const handleSubmit = useCallback(
    async (
      assignmentId: string,
      input: { driveLink: string; description: string; isLate: boolean }
    ) => {
      if (!user || !profile) throw new Error("You must be signed in.");
      await submitAssignment({
        assignmentId,
        userId: user.uid,
        studentName: profile.name,
        driveLink: input.driveLink,
        description: input.description,
        isLate: input.isLate,
      });
      await reload();
    },
    [user, profile, reload]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Assignments
        </h1>
        <p className="mt-1 text-slate-600">
          Submit each assignment before its deadline. One submission per
          assignment — no resubmissions.
        </p>
      </div>

      {assignError && (
        <EmptyState title="Could not load assignments" description={assignError} />
      )}

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <Skeleton className="mb-3 h-5 w-1/2" />
              <Skeleton className="mb-2 h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Once you’re enrolled in a course with assignments, they’ll appear here."
        />
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.courseId}>
              <h2 className="mb-4 font-heading text-lg font-semibold text-slate-900">
                {group.courseTitle}
              </h2>
              <div className="space-y-4">
                {group.list.map((a) => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    studentName={profile?.name ?? ""}
                    existingSubmission={
                      submissionByAssignmentId.get(a.id) ?? null
                    }
                    onSubmit={handleSubmit}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}