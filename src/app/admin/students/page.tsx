"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StudentTable } from "@/components/admin/StudentTable";
import { useAuth } from "@/hooks/useAuth";
import { fetchAllUsers, updateUserRole } from "@/lib/services/users";
import { fetchAllEnrollments } from "@/lib/services/enrollments";
import type { AppUser } from "@/lib/types";

export default function AdminStudentsPage() {
  const { user: currentAdmin } = useAuth();
  const [students, setStudents] = useState<AppUser[]>([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState<
    Map<string, number>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const [users, enrollments] = await Promise.all([
        fetchAllUsers(),
        fetchAllEnrollments(),
      ]);
      setStudents(
        [...users].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        )
      );
      const counts = new Map<string, number>();
      for (const e of enrollments) {
        counts.set(e.userId, (counts.get(e.userId) ?? 0) + 1);
      }
      setEnrollmentCounts(counts);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load students."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const enrollmentsByUser = useMemo(() => enrollmentCounts, [enrollmentCounts]);

  async function handleChangeRole(
    uid: string,
    role: "student" | "admin"
  ) {
    await updateUserRole(uid, role);
    setStudents((prev) =>
      prev.map((s) => (s.uid === uid ? { ...s, role } : s))
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Student Management
        </h1>
        <p className="mt-1 text-slate-600">
          All registered accounts. Promote a user to admin only when you
          intend to grant them full platform control.
        </p>
      </div>

      {error && (
        <EmptyState title="Could not load students" description={error} />
      )}

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <Skeleton className="h-5 w-1/3" />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No registered accounts yet"
          description="Students will appear here after they sign up."
        />
      ) : (
        <StudentTable
          students={students}
          enrollmentsByUser={enrollmentsByUser}
          currentAdminUid={currentAdmin?.uid ?? ""}
          onChangeRole={handleChangeRole}
        />
      )}
    </div>
  );
}