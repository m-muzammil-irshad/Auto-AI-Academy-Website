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
  onChangeRole: (uid: string, role: "student" | "admin") => Promise<void>;
}

export function StudentTable({
  students,
  enrollmentsByUser,
  currentAdminUid,
  onChangeRole,
}: StudentTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="hidden grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid">
        <div className="col-span-4">Student</div>
        <div className="col-span-2 text-center">Enrollments</div>
        <div className="col-span-2 text-center">Submissions</div>
        <div className="col-span-2 text-right">All-time stars</div>
        <div className="col-span-2 text-right">Role</div>
      </div>
      <ul className="divide-y divide-slate-100">
        {students.map((s) => (
          <StudentRow
            key={s.uid}
            student={s}
            enrollmentCount={enrollmentsByUser.get(s.uid) ?? 0}
            isSelf={s.uid === currentAdminUid}
            onChangeRole={onChangeRole}
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
  onChangeRole,
}: {
  student: AppUser;
  enrollmentCount: number;
  isSelf: boolean;
  onChangeRole: (uid: string, role: "student" | "admin") => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function toggleRole() {
    const next = student.role === "admin" ? "student" : "admin";
    const ok = window.confirm(
      `Change ${student.name}’s role to "${next}"?`
    );
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      await onChangeRole(student.uid, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update role.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-12 md:items-center">
      <div className="col-span-4 flex items-center gap-3">
        <Avatar name={student.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">
            {student.name}
          </p>
          <p className="truncate text-xs text-slate-500">{student.email}</p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>

      <div className="col-span-2 text-sm text-slate-700 md:text-center">
        <span className="md:hidden text-xs uppercase text-slate-500">
          Enrollments:{" "}
        </span>
        {enrollmentCount}
      </div>

      <div className="col-span-2 text-sm text-slate-700 md:text-center">
        <span className="md:hidden text-xs uppercase text-slate-500">
          Submissions:{" "}
        </span>
        {student.allTimeSubmissionCount}
      </div>

      <div className="col-span-2 text-sm font-medium tabular-nums text-slate-900 md:text-right">
        <span className="md:hidden text-xs uppercase text-slate-500">
          Stars:{" "}
        </span>
        {student.allTimeStars.toFixed(1)}
      </div>

      <div className="col-span-2 flex items-center justify-start gap-2 md:justify-end">
        <Badge variant={student.role === "admin" ? "info" : "neutral"}>
          {student.role}
        </Badge>
        {isSelf ? (
          <span className="text-xs text-slate-400">(you)</span>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleRole}
            loading={loading}
          >
            {student.role === "admin" ? "Demote" : "Promote"}
          </Button>
        )}
      </div>
    </li>
  );
}