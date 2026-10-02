"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
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
    <article className="flex flex-col rounded-2xl border border-slate-200/50 bg-white shadow-sm dark:border-slate-800/50 dark:bg-slate-900/50 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-500/10 dark:hover:shadow-accent-500/5">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800/50">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900/40 dark:to-accent-800/40">
            <span className="font-heading text-sm font-medium text-accent-700 dark:text-accent-400">
              Auto AI Academy
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
            {course.title}
          </h3>
          <Badge variant={courseStatusVariant(course.status)}>
            {COURSE_STATUS_LABELS[course.status]}
          </Badge>
        </div>
        <p className="mb-5 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
          {course.description}
        </p>

        {error && (
          <p className="mb-3 text-xs text-red-600">{error}</p>
        )}

        {isOngoing && (
          <Button onClick={handleEnroll} loading={loading}>
            Enroll Now
          </Button>
        )}

        {isSoon && (
          <Tooltip content="This course opens for enrollment soon — check back later.">
            <Button variant="secondary" disabled className="w-full">
              Coming Soon
            </Button>
          </Tooltip>
        )}

        {isCompleted && (
          <Tooltip content="This course is closed — no new enrollments.">
            <Button variant="secondary" disabled className="w-full">
              Completed
            </Button>
          </Tooltip>
        )}
      </div>
    </article>
  );
}