"use client";

import Link from "next/link";
import { useCourses } from "@/hooks/useCourses";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const FEATURED_LIMIT = 3;

export function FeaturedCourses() {
  const { courses, loading, error } = useCourses(FEATURED_LIMIT);

  return (
    <section className="border-t border-slate-100 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-2xl font-semibold sm:text-3xl">
              Featured courses
            </h2>
            <p className="mt-2 text-slate-600">
              A quick look at what’s available right now.
            </p>
          </div>
          <Link href="/courses">
            <Button variant="secondary">View all courses</Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
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
            description="New programming, AI, and automation courses will appear here as soon as they’re published."
          />
        ) : (
          <CourseGrid courses={courses} />
        )}
      </div>
    </section>
  );
}