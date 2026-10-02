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
    <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
      <div className="hidden grid-cols-12 gap-3 border-b border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 md:grid">
        <div className="col-span-4">Student</div>
        <div className="col-span-2 text-center">Enrollments</div>
        <div className="col-span-2 text-center">Submissions</div>
        <div className="col-span-2 text-right">All-time stars</div>
        <div className="col-span-2 text-right">Role</div>
      </div>
      <ul className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
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
    <li className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-12 md:items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <div className="col-span-4 flex items-center gap-3">
        <Avatar name={student.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
            {student.name}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
        </div>
      </div>

      <div className="col-span-2 text-sm text-slate-700 dark:text-slate-300 md:text-center">
        <span className="md:hidden text-xs uppercase text-slate-500 dark:text-slate-400">
          Enrollments:{" "}
        </span>
        {enrollmentCount}
      </div>

      <div className="col-span-2 text-sm text-slate-700 dark:text-slate-300 md:text-center">
        <span className="md:hidden text-xs uppercase text-slate-500 dark:text-slate-400">
          Submissions:{" "}
        </span>
        {student.allTimeSubmissionCount}
      </div>

      <div className="col-span-2 text-sm font-medium tabular-nums text-slate-900 dark:text-white md:text-right">
        <span className="md:hidden text-xs uppercase text-slate-500 dark:text-slate-400">
          Stars:{" "}
        </span>
        {student.allTimeStars.toFixed(1)}
      </div>

      <div className="col-span-2 flex items-center justify-start gap-2 md:justify-end">
        <Badge variant={student.role === "admin" ? "info" : "neutral"}>
          {student.role}
        </Badge>
        {isSelf && (
          <span className="text-xs text-slate-400 dark:text-slate-500">(you)</span>
        )}
      </div>
    </li>
  );
}