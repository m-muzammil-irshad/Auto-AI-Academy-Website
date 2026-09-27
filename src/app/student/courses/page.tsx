"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCourses } from "@/hooks/useCourses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { StudentCourseCard } from "@/components/courses/StudentCourseCard";
import { EnrolledCourseCard } from "@/components/courses/EnrolledCourseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StudentCoursesPage() {
  const { user } = useAuth();
  const { courses, loading: coursesLoading, error: coursesError } =
    useCourses();
  const {
    courseIds,
    loading: enrollmentsLoading,
    error: enrollmentsError,
    enroll,
  } = useEnrollments(user?.uid);

  const loading = coursesLoading || enrollmentsLoading;
  const error = coursesError || enrollmentsError;

  const enrolledSet = new Set(courseIds);
  const enrolledCourses = courses.filter((c) => enrolledSet.has(c.id));
  const catalogCourses = courses.filter((c) => !enrolledSet.has(c.id));

  return (
    <div className="mx-auto max-w-6xl space-y-12">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          My Courses
        </h1>
        <p className="mt-1 text-slate-600">
          Browse the catalog, and jump into the courses you’ve enrolled in.
        </p>
      </div>

      {error && (
        <EmptyState title="Could not load courses" description={error} />
      )}

      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold">
          Enrolled courses
        </h2>
        {loading ? (
          <GridSkeleton count={3} />
        ) : enrolledCourses.length === 0 ? (
          <EmptyState
            title="You haven’t enrolled in any courses yet"
            description="Pick an ongoing course below and click “Enroll Now” to get started."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((c) => (
              <EnrolledCourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-heading text-lg font-semibold">
          Course catalog
        </h2>
        {loading ? (
          <GridSkeleton count={3} />
        ) : catalogCourses.length === 0 ? (
          <EmptyState
            title="No courses available right now"
            description="New programming, AI, and automation courses will appear here as soon as they go live."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {catalogCourses.map((c) => (
              <StudentCourseCard key={c.id} course={c} onEnroll={enroll} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <Skeleton className="mb-4 aspect-video w-full" />
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
      ))}
    </div>
  );
}