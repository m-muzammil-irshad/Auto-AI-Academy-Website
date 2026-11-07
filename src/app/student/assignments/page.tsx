"use client";

import { useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useAssignments } from "@/hooks/useAssignments";
import { useSubmissions } from "@/hooks/useSubmissions";
import { useCourses } from "@/hooks/useCourses";
import { motion } from "framer-motion";
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

  const courseById = useMemo(() => {
    const map = new Map<string, (typeof courses)[number]>();
    for (const c of courses) map.set(c.id, c);
    return map;
  }, [courses]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof assignments>();
    for (const a of assignments) {
      const list = map.get(a.courseId) ?? [];
      list.push(a);
      map.set(a.courseId, list);
    }
    return Array.from(map.entries()).map(([courseId, list]) => {
      const course = courseById.get(courseId);
      return {
        courseId,
        courseTitle: course?.title ?? "Course",
        courseStatus: course?.status ?? "ongoing",
        list: [...list].sort(
          (a, b) => a.dueDate.toMillis() - b.dueDate.toMillis()
        ),
      };
    });
  }, [assignments, courseById]);

  const submissionByAssignmentId = useMemo(() => {
    const map = new Map<string, (typeof submissions)[number]>();
    for (const s of submissions) map.set(s.assignmentId, s);
    return map;
  }, [submissions]);

  const handleSubmit = useCallback(
    async (
      assignmentId: string,
      input: { driveLink: string; description: string; isLate: boolean; isCatchUp?: boolean }
    ) => {
      if (!user || !profile) throw new Error("You must be signed in.");
      const currentAssignment = assignments.find((a) => a.id === assignmentId);
      await submitAssignment({
        assignmentId,
        userId: user.uid,
        studentName: profile.name,
        driveLink: input.driveLink,
        description: input.description,
        isLate: input.isLate,
        isCatchUp: input.isCatchUp,
        assignmentTitle: currentAssignment?.title || "Assignment",
      });
      await reload();
    },
    [user, profile, reload, assignments]
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
          Assignments
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Submit each assignment before its deadline. One submission per
          assignment — no resubmissions.
        </p>
      </motion.div>

      {assignError && (
        <EmptyState title="Could not load assignments" description={assignError} />
      )}

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="neu-flat rounded-3xl p-6"
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
          {grouped.map((group, i) => {
            const isCompleted = group.courseStatus === "completed";
            const totalInCourse = group.list.length;
            const submittedInCourse = group.list.filter((a) =>
              submissionByAssignmentId.has(a.id)
            ).length;
            const isCatchUpEligible =
              isCompleted && totalInCourse > 0 && submittedInCourse / totalInCourse < 0.8;

            return (
              <motion.section 
                key={group.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.1 }}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
                    {group.courseTitle}
                  </h2>
                  {isCatchUpEligible && (
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      🎓 Catch-up Mode ({submittedInCourse}/{totalInCourse} Submitted · 80% needed for certificate)
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  {group.list.map((a) => (
                    <AssignmentCard
                      key={a.id}
                      assignment={a}
                      studentName={profile?.name ?? ""}
                      existingSubmission={
                        submissionByAssignmentId.get(a.id) ?? null
                      }
                      isCatchUpEligible={isCatchUpEligible}
                      onSubmit={handleSubmit}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}
