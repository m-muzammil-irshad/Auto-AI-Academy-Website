"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  resolvePlayableMedia,
  formatVideoTime,
  type PlayableMedia,
} from "@/lib/utils/youtube";
import type { Lesson } from "@/lib/types";

// Declare YouTube global for TypeScript
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface CoursePlayerProps {
  lesson: Lesson;
  courseTitle?: string;
  initialTimestampSeconds?: number;
  isCompleted: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  onNextLesson: () => void;
  onPreviousLesson: () => void;
  onToggleComplete: () => void;
  onTimeUpdate: (seconds: number) => void;
  onLessonEnded: () => void;
}

export function CoursePlayer({
  lesson,
  courseTitle = "",
  initialTimestampSeconds = 0,
  isCompleted,
  hasNext,
  hasPrevious,
  onNextLesson,
  onPreviousLesson,
  onToggleComplete,
  onTimeUpdate,
  onLessonEnded,
}: CoursePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTimestampSeconds);
  const [duration, setDuration] = useState(0);
  const [resumedNotice, setResumedNotice] = useState<string | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [useFallbackIframe, setUseFallbackIframe] = useState(false);

  // Guaranteed valid media resolution — NEVER null or error
  const media: PlayableMedia = resolvePlayableMedia(
    lesson.youtubeUrl,
    courseTitle,
    lesson.title
  );

  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onLessonEndedRef = useRef(onLessonEnded);
  onLessonEndedRef.current = onLessonEnded;

  // Load YouTube IFrame API script once with timeout safety
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const timer = setTimeout(() => {
      // If after 2.5s window.YT is not ready (e.g. adblocker or slow connection), fallback to pure iframe
      if (!window.YT || !window.YT.Player) {
        setUseFallbackIframe(true);
      }
    }, 2500);

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      clearTimeout(timer);
      setApiReady(true);
    };

    return () => clearTimeout(timer);
  }, []);

  // Initialize or update YouTube Player when media is a single video
  useEffect(() => {
    if (media.type !== "video" || !media.videoId) return;
    if (!apiReady || useFallbackIframe || !containerRef.current) return;

    // Clear previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const playerId = `yt-player-${lesson.id}`;
    let innerDiv = document.getElementById(playerId);
    if (!innerDiv) {
      containerRef.current.innerHTML = `<div id="${playerId}" class="w-full h-full rounded-xl"></div>`;
    }

    try {
      playerRef.current = new window.YT.Player(playerId, {
        videoId: media.videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: initialTimestampSeconds > 5 ? Math.floor(initialTimestampSeconds) : 0,
        },
        events: {
          onReady: (event: any) => {
            const playerDuration = event.target.getDuration();
            setDuration(playerDuration);

            // If there's a saved timestamp, seek to it
            if (initialTimestampSeconds > 5) {
              event.target.seekTo(initialTimestampSeconds, true);
              setResumedNotice(`Resumed from ${formatVideoTime(initialTimestampSeconds)}`);
              setTimeout(() => setResumedNotice(null), 5000);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
              setIsPlaying(true);
              if (timerRef.current) clearInterval(timerRef.current);

              timerRef.current = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                  const currentSecs = playerRef.current.getCurrentTime();
                  setCurrentTime(currentSecs);
                  onTimeUpdateRef.current(currentSecs);
                }
              }, 5000);
            } else if (event.data === 2) {
              setIsPlaying(false);
              if (timerRef.current) clearInterval(timerRef.current);
              if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                const currentSecs = playerRef.current.getCurrentTime();
                setCurrentTime(currentSecs);
                onTimeUpdateRef.current(currentSecs);
              }
            } else if (event.data === 0) {
              setIsPlaying(false);
              if (timerRef.current) clearInterval(timerRef.current);
              if (playerRef.current && typeof playerRef.current.getDuration === "function") {
                onTimeUpdateRef.current(playerRef.current.getDuration());
              }
              onLessonEndedRef.current();
            }
          },
        },
      });
    } catch (err) {
      console.warn("YouTube Player initialization warning, falling back to iframe:", err);
      setUseFallbackIframe(true);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, media.videoId, media.type, lesson.id, useFallbackIframe]);

  return (
    <div className="flex flex-col gap-4">
      {/* Video Container — Always plays smoothly */}
      <div className="relative aspect-video w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-950 shadow-md">
        {media.type === "playlist" ? (
          <iframe
            key={`pl-${media.playlistId}`}
            src={media.src}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : useFallbackIframe ? (
          <iframe
            key={`fallback-${media.videoId}`}
            src={media.src}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div ref={containerRef} className="w-full h-full overflow-hidden relative">
            {!apiReady && (
              <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
                <p className="text-xs font-medium">Loading video player…</p>
              </div>
            )}
          </div>
        )}

        {/* Resumed timestamp notice */}
        {resumedNotice && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-900/95 text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium shadow-md border border-white/10 animate-fade-in">
            <RotateCcw className="h-3.5 w-3.5 text-accent-400" />
            <span>{resumedNotice}</span>
          </div>
        )}
      </div>

      {/* Fallback channel hint banner if admin provided a channel link instead of a specific video ID */}
      {media.isFallback && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">
              Featuring foundational course lecture • You can also watch additional episodes on our YouTube channel.
            </span>
          </div>
          <a
            href={lesson.youtubeUrl || "https://youtube.com/@AutoAIAcademy"}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <span>Open Channel</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Action Controls & Navigation Bar */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3 flex flex-wrap items-center justify-between gap-3">
        {/* Previous Button */}
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrevious}
          onClick={onPreviousLesson}
          className="rounded-lg px-3.5 font-medium flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          title={hasPrevious ? "Previous lesson" : "First lesson"}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous Lesson</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        {/* Center: Mark Complete / Status */}
        <div className="flex items-center gap-2">
          <Button
            variant={isCompleted ? "primary" : "secondary"}
            size="sm"
            onClick={onToggleComplete}
            className={`rounded-lg px-4 font-medium flex items-center gap-2 transition-colors cursor-pointer ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "border border-slate-200/80 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <CheckCircle2
              className={`h-4 w-4 ${isCompleted ? "text-white" : "text-emerald-500"}`}
            />
            <span>{isCompleted ? "Completed" : "Mark as complete"}</span>
          </Button>
        </div>

        {/* Next Button */}
        <Button
          size="sm"
          disabled={!hasNext}
          onClick={onNextLesson}
          className="rounded-lg px-4 font-medium flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          title={hasNext ? "Next lesson" : "Last lesson in course"}
        >
          <span>{hasNext ? "Next Lesson" : "Last Lesson"}</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
