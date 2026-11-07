"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface DeleteCourseDialogProps {
  open: boolean;
  courseTitle: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteCourseDialog({
  open,
  courseTitle,
  onCancel,
  onConfirm,
}: DeleteCourseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete the course."
      );
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={loading ? () => {} : onCancel} title="Delete course?">
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          This will permanently delete <strong className="text-slate-900 dark:text-white">{courseTitle}</strong> and
          everything under it:
        </p>
        <ul className="space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li className="list-disc">The course itself</li>
          <li className="list-disc">All enrollments in this course</li>
          <li className="list-disc">All of its assignments</li>
          <li className="list-disc">
            All submissions tied to those assignments
          </li>
        </ul>
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          This action cannot be undone.
        </p>

        {error && (
          <div
            role="alert"
            className="animate-shake rounded-2xl neu-pressed-sm p-4 text-sm font-medium text-red-600 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading} className="rounded-full">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading} className="rounded-full">
            Yes, delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}