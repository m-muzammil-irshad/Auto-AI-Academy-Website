import { CourseCard } from "./CourseCard";
import type { Course } from "@/lib/types";

export interface CourseGridProps {
  courses: Course[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((c) => (
        <CourseCard key={c.id} course={c} />
      ))}
    </div>
  );
}