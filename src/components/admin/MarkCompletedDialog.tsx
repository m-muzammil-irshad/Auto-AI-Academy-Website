"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface MarkCompletedDialogProps {
  open: boolean;
  courseTitle: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function MarkCompletedDialog({
  open,
  courseTitle,
  onCancel,
  onConfirm,
}: MarkCompletedDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not mark as completed."
      );
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={loading ? () => {} : onCancel} title="Mark course as completed?">
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          <strong>{courseTitle}</strong> will be marked as{" "}
          <strong>Completed</strong>. After this:
        </p>
        <ul className="space-y-1 pl-5 text-sm text-slate-600">
          <li className="list-disc">No new enrollments will be allowed.</li>
          <li className="list-disc">
            No new assignments can be added to this course.
          </li>
          <li className="list-disc">
            Enrolled students who submitted ≥ 80% of assignments will unlock
            their certificate immediately.
          </li>
          <li className="list-disc">
            This action is one-way and cannot be undone.
          </li>
        </ul>

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
          <Button onClick={handleConfirm} loading={loading}>
            Yes, mark completed
          </Button>
        </div>
      </div>
    </Modal>
  );
}