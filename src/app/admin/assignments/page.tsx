"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { AssignmentForm } from "@/components/admin/AssignmentForm";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils/dates";
import { fetchCourses } from "@/lib/services/courses";
import {
  createAssignment,
  fetchAllAssignments,
  updateAssignment,
  type AssignmentInput,
} from "@/lib/services/assignments";
import { deleteAssignmentCascade } from "@/lib/services/cascade";
import type { Assignment, Course } from "@/lib/types";

interface DeleteTarget {
  assignment: Assignment;
  course: Course;
}

export default function AdminAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const [courseList, assignmentList] = await Promise.all([
        fetchCourses(),
        fetchAllAssignments(),
      ]);
      setCourses(courseList);
      setAssignments(assignmentList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load assignments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const courseById = useMemo(() => {
    const map = new Map<string, Course>();
    for (const c of courses) map.set(c.id, c);
    return map;
  }, [courses]);

  const ongoingCourses = useMemo(
    () => courses.filter((c) => c.status === "ongoing"),
    [courses]
  );

  /**
   * Assignments grouped by course, with courses ordered by title.
   * Assignments inside each group sorted by dueDate ascending.
   */
  const grouped = useMemo(() => {
    const byCourse = new Map<string, Assignment[]>();
    for (const a of assignments) {
      const list = byCourse.get(a.courseId) ?? [];
      list.push(a);
      byCourse.set(a.courseId, list);
    }
    return Array.from(byCourse.entries())
      .map(([courseId, list]) => ({
        courseId,
        course: courseById.get(courseId) ?? null,
        list: [...list].sort(
          (a, b) => a.dueDate.toMillis() - b.dueDate.toMillis()
        ),
      }))
      .filter((g) => g.course !== null)
      .sort((a, b) =>
        (a.course?.title ?? "").localeCompare(b.course?.title ?? "")
      );
  }, [assignments, courseById]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(assignment: Assignment) {
    setEditing(assignment);
    setFormOpen(true);
  }

  async function handleSubmit(input: AssignmentInput) {
    if (editing) {
      await updateAssignment(editing.id, input);
    } else {
      await createAssignment(input);
    }
    setFormOpen(false);
    setEditing(null);
    await reload();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteAssignmentCascade(deleteTarget.assignment.id);
    setDeleteTarget(null);
    await reload();
  }

  const noOngoingCourses = !loading && ongoingCourses.length === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            Assignment Management
          </h1>
          <p className="mt-1 text-slate-600">
            Add, edit, or delete assignments for your courses.
          </p>
        </div>
        <Button onClick={openCreate} disabled={noOngoingCourses}>
          Add assignment
        </Button>
      </div>

      {noOngoingCourses && courses.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          No ongoing courses available. Assignments can only be added to
          courses with status <strong>Ongoing</strong>. Flip a course from
          “Coming Soon” to “Ongoing” in Course Management first.
        </div>
      )}

      {error && (
        <EmptyState title="Could not load assignments" description={error} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <Skeleton className="mb-2 h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description={
            ongoingCourses.length === 0
              ? "Create a course with status “Ongoing” first, then add assignments to it."
              : "Add your first assignment to make it visible to enrolled students."
          }
          action={
            ongoingCourses.length > 0 ? (
              <Button onClick={openCreate}>Add assignment</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => {
            const course = group.course!;
            const isCompleted = course.status === "completed";
            return (
              <section key={group.courseId}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h2 className="font-heading text-lg font-semibold text-slate-900">
                    {course.title}
                  </h2>
                  <Badge variant={courseStatusVariant(course.status)}>
                    {COURSE_STATUS_LABELS[course.status]}
                  </Badge>
                  {isCompleted && (
                    <span className="text-xs text-slate-500">
                      Assignment list is frozen.
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {group.list.map((a) => (
                    <AssignmentRow
                      key={a.id}
                      assignment={a}
                      onEdit={() => openEdit(a)}
                      onDelete={
                        isCompleted
                          ? null
                          : () =>
                              setDeleteTarget({
                                assignment: a,
                                course,
                              })
                      }
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit assignment" : "Add assignment"}
        className="max-w-2xl"
      >
        <AssignmentForm
          assignment={editing ?? undefined}
          courses={editing ? courses : ongoingCourses}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete assignment?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            This will permanently delete{" "}
            <strong>{deleteTarget?.assignment.title}</strong> from{" "}
            <strong>{deleteTarget?.course.title}</strong> and remove all of its
            submissions.
          </p>
          <p className="text-sm text-slate-700">
            The course and any other assignments are unaffected. This action
            cannot be undone.
          </p>
          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Yes, delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AssignmentRow({
  assignment,
  onEdit,
  onDelete,
}: {
  assignment: Assignment;
  onEdit: () => void;
  onDelete: (() => void) | null;
}) {
  return (
    <Card>
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-heading text-base font-semibold text-slate-900">
            {assignment.title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Due {formatDateTime(assignment.dueDate)}
          </p>
          {assignment.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {assignment.description}
            </p>
          )}
          {assignment.deliverables.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              {assignment.deliverables.length}{" "}
              {assignment.deliverables.length === 1
                ? "deliverable"
                : "deliverables"}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          {onDelete && (
            <Button variant="danger" size="sm" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}