"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
          My Courses
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Browse the catalog, and jump into the courses you’ve enrolled in.
        </p>
      </motion.div>

      {error && (
        <EmptyState title="Could not load courses" description={error} />
      )}

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <h2 className="mb-4 font-heading text-lg font-semibold text-slate-900 dark:text-white">
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
          <motion.div 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {enrolledCourses.map((c) => (
              <motion.div key={c.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <EnrolledCourseCard course={c} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <h2 className="mb-4 font-heading text-lg font-semibold text-slate-900 dark:text-white">
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
          <motion.div 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {catalogCourses.map((c) => (
              <motion.div key={c.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
                <StudentCourseCard course={c} onEnroll={enroll} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/50 bg-white/50 p-4 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50"
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

