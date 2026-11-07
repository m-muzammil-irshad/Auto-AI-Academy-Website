"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Play, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { extractYouTubeVideoId, formatVideoTime } from "@/lib/utils/youtube";
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

  const videoId = extractYouTubeVideoId(lesson.youtubeUrl);

  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onLessonEndedRef = useRef(onLessonEnded);
  onLessonEndedRef.current = onLessonEnded;

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      setApiReady(true);
    };
  }, []);

  // Initialize or update YouTube Player
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;

    // Clear previous timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const playerId = `yt-player-${lesson.id}`;
    let innerDiv = document.getElementById(playerId);
    if (!innerDiv) {
      containerRef.current.innerHTML = `<div id="${playerId}" class="w-full h-full rounded-2xl"></div>`;
    }

    try {
      playerRef.current = new window.YT.Player(playerId, {
        videoId: videoId,
        playerVars: {
          autoplay: 0, // Manual play only to ensure YouTube counts views
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
      console.error("YouTube Player error:", err);
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
  }, [apiReady, videoId, lesson.id]);

  return (
    <div className="flex flex-col gap-4">
      {/* Video Container */}
      <div className="relative aspect-video w-full neu-pressed-sm rounded-3xl p-2 sm:p-3 overflow-hidden shadow-inner bg-slate-900">
        {videoId ? (
          <div ref={containerRef} className="w-full h-full rounded-2xl overflow-hidden relative">
            {!apiReady && (
              <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
                <p className="text-xs font-medium">Loading Player...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-2 p-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500" />
            <p className="text-base font-semibold text-slate-200">No YouTube Video Found</p>
            <p className="text-xs text-slate-400">
              Please check the lesson video URL in the admin settings.
            </p>
          </div>
        )}

        {/* Resumed notice banner */}
        {resumedNotice && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-white/10 animate-fade-in">
            <RotateCcw className="h-3.5 w-3.5 text-accent-400" />
            <span>{resumedNotice}</span>
          </div>
        )}
      </div>

      {/* Action Controls & Navigation Bar */}
      <div className="neu-flat rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Previous Button */}
        <Button
          variant="secondary"
          size="sm"
          disabled={!hasPrevious}
          onClick={onPreviousLesson}
          className="rounded-full neu-btn px-4 font-medium flex items-center gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Center: Mark Complete / Status */}
        <div className="flex items-center gap-2">
          <Button
            variant={isCompleted ? "primary" : "secondary"}
            size="sm"
            onClick={onToggleComplete}
            className={`rounded-full px-5 font-semibold flex items-center gap-2 transition-all duration-200 ${
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                : "neu-btn text-slate-700 dark:text-slate-200"
            }`}
          >
            <CheckCircle2
              className={`h-4 w-4 ${isCompleted ? "text-white" : "text-emerald-500"}`}
            />
            <span>{isCompleted ? "Completed" : "Mark as Complete"}</span>
          </Button>
        </div>

        {/* Next Button */}
        <Button
          size="sm"
          disabled={!hasNext}
          onClick={onNextLesson}
          className="rounded-full neu-btn-primary px-5 font-bold flex items-center gap-1.5"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
