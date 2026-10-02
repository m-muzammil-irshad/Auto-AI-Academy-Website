import Image from "next/image";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import type { Course } from "@/lib/types";

export interface EnrolledCourseCardProps {
  course: Course;
}

export function EnrolledCourseCard({ course }: EnrolledCourseCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm dark:border-slate-800/50 dark:bg-slate-900/50 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-accent-500/10 dark:hover:shadow-accent-500/5">
      <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800/50">
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
        {course.status === "completed" && (
          <div className="absolute right-3 top-3">
            <Badge variant={courseStatusVariant("completed")}>
              {COURSE_STATUS_LABELS.completed}
            </Badge>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 font-heading text-base font-semibold text-slate-900 dark:text-white">
          {course.title}
        </h3>
        <p className="mb-5 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
          {course.description}
        </p>
        <a
          href={course.youtubeChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="secondary" className="w-full">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
            </svg>
            Watch on YouTube
          </Button>
        </a>
      </div>
    </article>
  );
}