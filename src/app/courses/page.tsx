"use client";

import { motion } from "framer-motion";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useCourses } from "@/hooks/useCourses";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PublicCoursesPage() {
  const { courses, loading, error } = useCourses();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10rem] right-1/4 h-[30rem] w-[30rem] rounded-full bg-accent-500/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <SiteHeader />
      
      <main className="flex-1 relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-12 max-w-2xl"
          >
            <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              All <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-purple-600 dark:from-accent-400 dark:to-purple-400">Courses</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Browse our complete catalog of programming, AI, and automation courses. Sign up to enroll and start submitting assignments.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/50 bg-white/50 p-1 shadow-sm backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50"
                >
                  <div className="aspect-video w-full rounded-xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                  <div className="p-5">
                    <div className="mb-3 h-6 w-3/4 rounded bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                    <div className="h-4 w-full rounded bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                    <div className="mt-2 h-4 w-5/6 rounded bg-slate-200/50 dark:bg-slate-800/50 animate-pulse" />
                  </div>
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <CourseGrid courses={courses} />
            </motion.div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

