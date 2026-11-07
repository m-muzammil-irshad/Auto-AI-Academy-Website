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
    <div className="overflow-hidden rounded-3xl neu-flat p-3">
      <div className="hidden grid-cols-12 gap-3 neu-pressed-sm rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 md:grid mb-2">
        <div className="col-span-4">Student</div>
        <div className="col-span-2 text-center">Enrollments</div>
        <div className="col-span-2 text-center">Submissions</div>
        <div className="col-span-2 text-right">All-time stars</div>
        <div className="col-span-2 text-right">Role</div>
      </div>
      <ul className="divide-y divide-black/5 dark:divide-white/5">
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
    <li className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-12 md:items-center hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
      <div className="col-span-4 flex items-center gap-3">
        <Avatar name={student.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
            {student.name}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{student.email}</p>
        </div>
      </div>

      <div className="col-span-2 text-sm text-slate-700 dark:text-slate-300 md:text-center">
        <span className="md:hidden text-xs uppercase text-slate-500 dark:text-slate-400">
          Enrollments:{" "}
        </span>
        <span className="neu-pressed-sm rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
          {enrollmentCount}
        </span>
      </div>

      <div className="col-span-2 text-sm text-slate-700 dark:text-slate-300 md:text-center">
        <span className="md:hidden text-xs uppercase text-slate-500 dark:text-slate-400">
          Submissions:{" "}
        </span>
        <span className="neu-pressed-sm rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
          {student.allTimeSubmissionCount}
        </span>
      </div>

      <div className="col-span-2 text-sm font-medium tabular-nums text-slate-900 dark:text-white md:text-right">
        <span className="md:hidden text-xs uppercase text-slate-500 dark:text-slate-400">
          Stars:{" "}
        </span>
        <span className="neu-pressed-sm rounded-full px-3 py-0.5 text-xs font-bold text-accent-600 dark:text-accent-400 tabular-nums">
          {student.allTimeStars.toFixed(1)} ★
        </span>
      </div>

      <div className="col-span-2 flex items-center justify-start gap-2 md:justify-end">
        <Badge variant={student.role === "admin" ? "info" : "neutral"} className="neu-flat border-none shadow-sm font-bold">
          {student.role}
        </Badge>
        {isSelf && (
          <span className="text-xs text-slate-400 dark:text-slate-500">(you)</span>
        )}
      </div>
    </li>
  );
}