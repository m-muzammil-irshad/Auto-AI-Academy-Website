"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useCourses } from "@/hooks/useCourses";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PublicCoursesPage() {
  const { courses, loading, error } = useCourses();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-10 max-w-2xl">
            <h1 className="font-heading text-3xl font-semibold">Courses</h1>
            <p className="mt-2 text-slate-600">
              Every course on Auto AI Academy. Sign up to enroll and start
              submitting.
            </p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
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
          ) : error ? (
            <EmptyState title="Could not load courses" description={error} />
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses yet — check back soon!"
              description="New programming, AI, and automation courses will be listed here as soon as they go live."
            />
          ) : (
            <CourseGrid courses={courses} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}