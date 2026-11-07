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
    <article className="neu-flat-interactive relative flex h-full flex-col overflow-hidden rounded-3xl p-3 sm:p-3.5">
      <div className="neu-pressed-sm relative aspect-video w-full overflow-hidden rounded-2xl p-1">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-[#151926]">
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
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/40 dark:to-accent-800/40">
              <span className="font-heading text-sm font-medium text-accent-700 dark:text-accent-400">
                Auto AI Academy
              </span>
            </div>
          )}
          <div className="absolute top-2.5 right-2.5 z-10">
            <Badge variant={courseStatusVariant(course.status)} className="neu-flat text-xs font-bold rounded-full px-2.5 py-0.5 border-none shadow-sm">
              {COURSE_STATUS_LABELS[course.status]}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-2">
          <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
            {course.title}
          </h3>
        </div>
        <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {course.description}
        </p>
        <CourseMeta course={course} className="mb-5" />

        {error && (
          <p className="mb-3 text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5">
          {isOngoing && (
            <Button onClick={handleEnroll} loading={loading} className="w-full neu-btn-primary rounded-full font-bold">
              Enroll Now
            </Button>
          )}

          {isSoon && (
            <Tooltip content="This course opens for enrollment soon — check back later.">
              <Button variant="secondary" disabled className="w-full neu-btn rounded-full font-semibold">
                Coming Soon
              </Button>
            </Tooltip>
          )}

          {isCompleted && (
            <Tooltip content="This course is closed — no new enrollments.">
              <Button variant="secondary" disabled className="w-full neu-btn rounded-full font-semibold">
                Completed
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </article>
  );
}