"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, courseStatusVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { CourseForm } from "@/components/admin/CourseForm";
import { MarkCompletedDialog } from "@/components/admin/MarkCompletedDialog";
import { DeleteCourseDialog } from "@/components/admin/DeleteCourseDialog";
import { COURSE_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils/dates";
import {
  createCourse,
  fetchCourses,
  markCourseCompleted,
  updateCourse,
  type CourseInput,
} from "@/lib/services/courses";
import { deleteCourseCascade } from "@/lib/services/cascade";
import type { Course } from "@/lib/types";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const [completedTarget, setCompletedTarget] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const list = await fetchCourses();
      setCourses(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load courses."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(course: Course) {
    setEditing(course);
    setFormOpen(true);
  }

  async function handleSubmit(input: CourseInput) {
    if (editing) {
      await updateCourse(editing.id, input);
    } else {
      await createCourse(input);
    }
    setFormOpen(false);
    setEditing(null);
    await reload();
  }

  async function handleMarkCompleted() {
    if (!completedTarget) return;
    await markCourseCompleted(completedTarget.id);
    setCompletedTarget(null);
    await reload();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteCourseCascade(deleteTarget.id);
    setDeleteTarget(null);
    await reload();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl text-slate-900 dark:text-white">
            Course Management
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Create, edit, mark completed, or delete courses.
          </p>
        </div>
        <Button onClick={openCreate}>Add course</Button>
      </motion.div>

      {error && (
        <EmptyState title="Could not load courses" description={error} />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4"
            >
              <Skeleton className="mb-2 h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Add your first course to make it visible to students."
          action={<Button onClick={openCreate}>Add course</Button>}
        />
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          className="space-y-3"
        >
          {courses.map((course) => (
            <CourseRow
              key={course.id}
              course={course}
              onEdit={() => openEdit(course)}
              onMarkCompleted={() => setCompletedTarget(course)}
              onDelete={() => setDeleteTarget(course)}
            />
          ))}
        </motion.div>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit course" : "Add course"}
        className="max-w-lg"
      >
        <CourseForm
          course={editing ?? undefined}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
        />
      </Modal>

      <MarkCompletedDialog
        open={!!completedTarget}
        courseTitle={completedTarget?.title ?? ""}
        onCancel={() => setCompletedTarget(null)}
        onConfirm={handleMarkCompleted}
      />

      <DeleteCourseDialog
        open={!!deleteTarget}
        courseTitle={deleteTarget?.title ?? ""}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function CourseRow({
  course,
  onEdit,
  onMarkCompleted,
  onDelete,
}: {
  course: Course;
  onEdit: () => void;
  onMarkCompleted: () => void;
  onDelete: () => void;
}) {
  const canMarkCompleted = course.status === "ongoing";

  return (
    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}>
      <Card className="transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-accent-500/5">
      <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
              {course.title}
            </h3>
            <Badge variant={courseStatusVariant(course.status)}>
              {COURSE_STATUS_LABELS[course.status]}
            </Badge>
          </div>
          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
            {course.description}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Created {formatDate(course.createdAt)}
            {course.completedAt && ` · Completed ${formatDate(course.completedAt)}`}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Edit
          </Button>
          {canMarkCompleted && (
            <Button variant="secondary" size="sm" onClick={onMarkCompleted}>
              Mark completed
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </CardBody>
    </Card>
    </motion.div>
  );
}

