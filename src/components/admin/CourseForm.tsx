"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Video, ListVideo } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { COURSE_LEVEL_LABELS } from "@/lib/constants";
import type { Course, CourseLevel, CourseStatus, Lesson } from "@/lib/types";
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

const LEVEL_OPTIONS = [
  { value: "", label: "Not set" },
  ...Object.entries(COURSE_LEVEL_LABELS).map(([value, label]) => ({ value, label })),
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
  const [level, setLevel] = useState<CourseLevel | "">(course?.level ?? "");
  const [duration, setDuration] = useState(course?.duration ?? "");
  const [lessonCount, setLessonCount] = useState(
    course?.lessonCount != null ? String(course.lessonCount) : ""
  );
  // One outcome per line in the textarea.
  const [outcomes, setOutcomes] = useState((course?.outcomes ?? []).join("\n"));
  const [lessons, setLessons] = useState<Lesson[]>(course?.lessons ?? []);
  
  // New lesson inputs
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonUrl, setNewLessonUrl] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleAddLesson() {
    if (!newLessonTitle.trim() || !newLessonUrl.trim()) {
      setError("Please enter both a lesson title and a YouTube URL/ID.");
      return;
    }
    setError("");
    const newLesson: Lesson = {
      id: `lesson_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: newLessonTitle.trim(),
      youtubeUrl: newLessonUrl.trim(),
      duration: newLessonDuration.trim() || undefined,
      order: lessons.length + 1,
    };
    const updated = [...lessons, newLesson];
    setLessons(updated);
    setLessonCount(String(updated.length));
    setNewLessonTitle("");
    setNewLessonUrl("");
    setNewLessonDuration("");
  }

  function handleDeleteLesson(index: number) {
    const updated = lessons.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i + 1 }));
    setLessons(updated);
    setLessonCount(String(updated.length));
  }

  function handleMoveLesson(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    const updated = [...lessons];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setLessons(updated.map((l, i) => ({ ...l, order: i + 1 })));
  }

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

    const parsedLessonCount = lessonCount.trim() === "" ? (lessons.length > 0 ? lessons.length : null) : Number(lessonCount);
    if (parsedLessonCount !== null && (!Number.isInteger(parsedLessonCount) || parsedLessonCount < 1)) {
      setError("Number of lessons must be a whole number greater than zero.");
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
        level,
        duration: duration.trim(),
        lessonCount: parsedLessonCount,
        lessons: lessons,
        outcomes: outcomes
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        status: isCompleted ? "completed" : status,
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
          className="animate-shake rounded-2xl neu-pressed-sm p-4 text-sm font-medium text-red-600 dark:text-red-400"
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Level (optional)"
          value={level}
          onChange={(e) => setLevel(e.target.value as CourseLevel | "")}
          options={LEVEL_OPTIONS}
          disabled={loading}
        />
        <Input
          label="Duration (optional)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 6 weeks"
          disabled={loading}
        />
        <Input
          label="Lessons (optional)"
          type="number"
          min={1}
          value={lessonCount}
          onChange={(e) => setLessonCount(e.target.value)}
          placeholder="e.g. 24"
          disabled={loading}
        />
      </div>

      <Textarea
        label="What students will learn (optional)"
        value={outcomes}
        onChange={(e) => setOutcomes(e.target.value)}
        rows={4}
        placeholder={"Write Python programs from scratch\nAutomate everyday tasks"}
        hint="One point per line. Shown as a checklist on the course page."
        disabled={loading}
      />

      {/* Course Curriculum / Lessons Section */}
      <div className="border border-black/10 dark:border-white/10 rounded-2xl p-4 neu-flat space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListVideo className="h-5 w-5 text-accent-500" />
            <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Course Lessons & Videos ({lessons.length})
            </h4>
          </div>
          <span className="text-xs text-slate-500">Each lesson will embed in the student classroom</span>
        </div>

        {/* Existing Lessons List */}
        {lessons.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl neu-pressed-sm text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-accent-600 dark:text-accent-400 w-5">
                    #{idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {lesson.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{lesson.youtubeUrl}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {lesson.duration && (
                    <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                      {lesson.duration}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleMoveLesson(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 hover:text-accent-500 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveLesson(idx, "down")}
                    disabled={idx === lessons.length - 1}
                    className="p-1 hover:text-accent-500 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLesson(idx)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Remove Lesson"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic p-2 rounded-xl neu-pressed-sm text-center">
            No individual lessons added yet. The main YouTube link will be used as default.
          </p>
        )}

        {/* Add New Lesson Input Row */}
        <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Add a New Lesson
          </p>
          <div className="grid gap-2 sm:grid-cols-12 items-end">
            <div className="sm:col-span-5">
              <Input
                placeholder="Lesson Title (e.g. Python Variables)"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="sm:col-span-4">
              <Input
                placeholder="YouTube URL or Video ID"
                value={newLessonUrl}
                onChange={(e) => setNewLessonUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                placeholder="Duration (12:30)"
                value={newLessonDuration}
                onChange={(e) => setNewLessonDuration(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="sm:col-span-1">
              <Button
                type="button"
                size="sm"
                onClick={handleAddLesson}
                className="w-full neu-btn-primary rounded-xl h-10 flex items-center justify-center p-0"
                title="Add Lesson"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isCompleted ? (
        <div>
          <p className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Status
          </p>
          <div className="rounded-xl neu-pressed-sm px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 font-medium">
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
          className="rounded-full"
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="neu-btn-primary rounded-full font-bold">
          {isEdit ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );
}