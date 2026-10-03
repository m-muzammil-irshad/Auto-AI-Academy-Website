"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import type { Course, CourseStatus } from "@/lib/types";
import type { CourseInput } from "@/lib/services/courses";

export interface CourseFormProps {
  /** When present, form is in edit mode. */
  course?: Course;
  onCancel: () => void;
  onSubmit: (input: CourseInput) => Promise<void>;
}

type EditableStatus = Extract<CourseStatus, "ongoing" | "soon">;

const STATUS_OPTIONS = [
  { value: "ongoing", label: "Ongoing — enrollments open" },
  { value: "soon", label: "Coming Soon — visible, disabled" },
];

export function CourseForm({ course, onCancel, onSubmit }: CourseFormProps) {
  const isEdit = !!course;
  const isCompleted = course?.status === "completed";

  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(
    course?.youtubeChannelUrl ?? ""
  );
  const [outlineUrl, setOutlineUrl] = useState(course?.outlineUrl ?? "");
  const [thumbnail, setThumbnail] = useState(course?.thumbnail ?? "");
  const [status, setStatus] = useState<EditableStatus>(
    (course?.status === "completed" ? "ongoing" : course?.status) ?? "soon"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedUrl = youtubeChannelUrl.trim();

    if (trimmedTitle.length < 3) {
      setError("Please enter a title of at least 3 characters.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setError("YouTube link must be a full URL starting with http(s)://");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        thumbnail: thumbnail.trim(),
        youtubeChannelUrl: trimmedUrl,
        outlineUrl: outlineUrl.trim(),
        status,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the course."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Input
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        disabled={loading}
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        disabled={loading}
      />

      <Input
        label="YouTube channel / playlist link"
        type="url"
        value={youtubeChannelUrl}
        onChange={(e) => setYoutubeChannelUrl(e.target.value)}
        placeholder="https://youtube.com/..."
        required
        disabled={loading}
      />

      <Input
        label="Thumbnail image URL (optional)"
        type="url"
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
        placeholder="https://..."
        hint="Paste a public image URL. Leave blank for a neutral placeholder."
        disabled={loading}
      />

      <Input
        label="Course Outline URL (optional)"
        type="url"
        value={outlineUrl}
        onChange={(e) => setOutlineUrl(e.target.value)}
        placeholder="https://..."
        hint="Link to a Word document, PDF, or any other outline file."
        disabled={loading}
      />

      {isCompleted ? (
        <div>
          <p className="mb-1 block text-sm font-medium text-slate-700">
            Status
          </p>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Completed — this action is final and cannot be undone.
          </div>
        </div>
      ) : (
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as EditableStatus)}
          options={STATUS_OPTIONS}
          disabled={loading}
        />
      )}

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {isEdit ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );
}