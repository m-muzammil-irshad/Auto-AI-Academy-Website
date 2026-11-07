"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { CourseMeta } from "@/components/courses/CourseMeta";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { SHIMMER_BLUR_16_9 } from "@/lib/imageBlur";
import type { Course } from "@/lib/types";

export interface StudentCourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => Promise<void>;
}

export function StudentCourseCard({
  course,
  onEnroll,
}: StudentCourseCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isOngoing = course.status === "ongoing";
  const isSoon = course.status === "soon";
  const isCompleted = course.status === "completed";

  async function handleEnroll() {
    setLoading(true);
    setError("");
    try {
      await onEnroll(course.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enroll.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 shadow-sm transition-colors hover:border-slate-300 dark:hover:border-slate-700">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-950">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            placeholder="blur"
            blurDataURL={SHIMMER_BLUR_16_9}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-900">
            <span className="font-heading text-sm font-medium text-slate-500 dark:text-slate-400">
              Auto AI Academy
            </span>
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 z-10">
          <Badge variant={courseStatusVariant(course.status)}>
            {COURSE_STATUS_LABELS[course.status]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="mb-1.5 font-heading text-base font-medium text-slate-900 dark:text-white line-clamp-1">
          {course.title}
        </h3>
        <p className="mb-3 line-clamp-2 flex-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {course.description}
        </p>
        <CourseMeta course={course} className="mb-4" />

        {error && (
          <p className="mb-3 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/80">
          {isOngoing && (
            <Button onClick={handleEnroll} loading={loading} className="w-full rounded-lg text-xs font-medium">
              Enroll in course
            </Button>
          )}

          {isSoon && (
            <Tooltip content="This course opens for enrollment soon — check back later.">
              <Button variant="secondary" disabled className="w-full rounded-lg text-xs font-medium">
                Coming soon
              </Button>
            </Tooltip>
          )}

          {isCompleted && (
            <Tooltip content="This course is closed — no new enrollments.">
              <Button variant="secondary" disabled className="w-full rounded-lg text-xs font-medium">
                Completed
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </article>
  );
}
