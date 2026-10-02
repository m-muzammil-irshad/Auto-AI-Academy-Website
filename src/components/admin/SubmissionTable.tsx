"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { GradingForm } from "./GradingForm";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/dates";
import { isGraded } from "@/lib/utils/stars";
import type { Assignment, Course, Grading, Submission } from "@/lib/types";

export interface SubmissionTableProps {
  submissions: Submission[];
  courseById: Map<string, Course>;
  assignmentById: Map<string, Assignment>;
  onGrade: (submission: Submission, grading: Grading) => Promise<void>;
}

export function SubmissionTable({
  submissions,
  courseById,
  assignmentById,
  onGrade,
}: SubmissionTableProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <motion.ul 
      initial="hidden"
      animate="show"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      className="space-y-3"
    >
      {submissions.map((s) => {
        const assignment = assignmentById.get(s.assignmentId);
        const course = assignment ? courseById.get(assignment.courseId) : null;
        const graded = isGraded(s.grading);
        const isOpen = openId === s.id;

        return (
          <motion.li
            variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
            key={s.id}
            className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md dark:hover:shadow-accent-500/5"
          >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Avatar name={s.studentName} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {s.studentName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {assignment?.title ?? "Assignment"} ·{" "}
                    {course?.title ?? "Course"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Submitted {formatDateTime(s.submittedAt)}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {graded ? (
                  <Badge variant="success">
                    {s.grading!.finalStars.toFixed(1)} ★
                  </Badge>
                ) : (
                  <Badge variant="warning">Not graded</Badge>
                )}
                <a
                  href={s.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300"
                >
                  Open link ↗
                </a>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : s.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    isOpen
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      : "bg-accent-600 dark:bg-accent-500 text-white hover:bg-accent-700 dark:hover:bg-accent-400"
                  )}
                >
                  {isOpen ? "Close" : graded ? "Update grade" : "Grade"}
                </button>
              </div>
            </div>

            {s.description && (
              <div className="border-t border-slate-100/50 dark:border-slate-800/50 px-4 py-2">
                <p className="whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-400">
                  {s.description}
                </p>
              </div>
            )}

            {isOpen && (
              <div className="border-t border-slate-100/50 dark:border-slate-800/50 p-4">
                <GradingForm
                  submission={s}
                  onSave={async (g) => {
                    await onGrade(s, g);
                    setOpenId(null);
                  }}
                />
              </div>
            )}
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

