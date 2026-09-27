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
        <p className="text-sm text-slate-700">
          This will permanently delete <strong>{courseTitle}</strong> and
          everything under it:
        </p>
        <ul className="space-y-1 pl-5 text-sm text-slate-600">
          <li className="list-disc">The course itself</li>
          <li className="list-disc">All enrollments in this course</li>
          <li className="list-disc">All of its assignments</li>
          <li className="list-disc">
            All submissions tied to those assignments
          </li>
        </ul>
        <p className="text-sm text-slate-700">
          This action cannot be undone.
        </p>

        {error && (
          <div
            role="alert"
            className="rounded-md bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} loading={loading}>
            Yes, delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}