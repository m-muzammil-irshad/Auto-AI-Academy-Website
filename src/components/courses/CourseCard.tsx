import Image from "next/image";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import type { Course } from "@/lib/types";

export interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-video w-full bg-slate-100">
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
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-100 to-accent-50">
            <span className="font-heading text-sm font-medium text-accent-700">
              Auto AI Academy
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="font-heading text-base font-semibold text-slate-900">
            {course.title}
          </h3>
          <Badge variant={courseStatusVariant(course.status)}>
            {COURSE_STATUS_LABELS[course.status]}
          </Badge>
        </div>
        <p className="line-clamp-3 text-sm text-slate-600">
          {course.description}
        </p>
      </div>
    </article>
  );
}