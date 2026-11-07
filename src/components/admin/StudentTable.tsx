"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AppUser } from "@/lib/types";

export interface StudentTableProps {
  students: AppUser[];
  enrollmentsByUser: Map<string, number>;
  currentAdminUid: string;
}

export function StudentTable({
  students,
  enrollmentsByUser,
  currentAdminUid,
}: StudentTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/50">
      <div className="hidden grid-cols-12 gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400 md:grid">
        <div className="col-span-4">Student</div>
        <div className="col-span-2 text-center">Enrollments</div>
        <div className="col-span-2 text-center">Submissions</div>
        <div className="col-span-2 text-right">All-time stars</div>
        <div className="col-span-2 text-right">Role</div>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {students.map((s) => (
          <StudentRow
            key={s.uid}
            student={s}
            enrollmentCount={enrollmentsByUser.get(s.uid) ?? 0}
            isSelf={s.uid === currentAdminUid}
          />
        ))}
      </ul>
    </div>
  );
}

function StudentRow({
  student,
  enrollmentCount,
  isSelf,
}: {
  student: AppUser;
  enrollmentCount: number;
  isSelf: boolean;
}) {

  return (
    <li className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-12 md:items-center hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
      <div className="col-span-4 flex items-center gap-3">
        <Avatar name={student.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
            {student.name}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
        </div>
      </div>

      <div className="col-span-2 text-sm text-slate-700 dark:text-slate-300 md:text-center">
        <span className="md:hidden text-xs text-slate-500 dark:text-slate-400">
          Enrollments:{" "}
        </span>
        <span className="rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 tabular-nums">
          {enrollmentCount}
        </span>
      </div>

      <div className="col-span-2 text-sm text-slate-700 dark:text-slate-300 md:text-center">
        <span className="md:hidden text-xs text-slate-500 dark:text-slate-400">
          Submissions:{" "}
        </span>
        <span className="rounded-md border border-slate-200/70 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 tabular-nums">
          {student.allTimeSubmissionCount}
        </span>
      </div>

      <div className="col-span-2 text-sm font-medium tabular-nums text-slate-900 dark:text-white md:text-right">
        <span className="md:hidden text-xs text-slate-500 dark:text-slate-400">
          Stars:{" "}
        </span>
        <span className="rounded-md border border-amber-200/60 bg-amber-50/50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-400 tabular-nums">
          {student.allTimeStars.toFixed(1)} ★
        </span>
      </div>

      <div className="col-span-2 flex items-center justify-start gap-2 md:justify-end">
        <Badge variant={student.role === "admin" ? "info" : "neutral"} className="font-medium text-xs">
          {student.role}
        </Badge>
        {isSelf && (
          <span className="text-xs text-slate-400 dark:text-slate-500">(you)</span>
        )}
      </div>
    </li>
  );
}