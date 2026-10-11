import { BarChart3, Clock, PlayCircle } from "lucide-react";
import { COURSE_LEVEL_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import type { Course } from "@/lib/types";

/** Level, lesson count and duration for a course. Renders nothing if none are set. */
export function CourseMeta({ course, className }: { course: Course; className?: string }) {
  const items = [
    course.level && { icon: BarChart3, text: COURSE_LEVEL_LABELS[course.level] },
    course.lessonCount && {
      icon: PlayCircle,
      text: `${course.lessonCount} ${course.lessonCount === 1 ? "lesson" : "lessons"}`,
    },
    course.duration && { icon: Clock, text: course.duration },
  ].filter((item): item is { icon: typeof Clock; text: string } => !!item);

  if (items.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500 dark:text-slate-400", className)}>
      {items.map((item) => (
        <li key={item.text} className="inline-flex items-center gap-1.5">
          <item.icon className="h-3.5 w-3.5 text-accent-500" aria-hidden="true" />
          {item.text}
        </li>
      ))}
    </ul>
  );
}
