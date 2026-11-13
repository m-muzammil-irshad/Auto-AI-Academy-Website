"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ExternalLink,
  Sparkles,
  Lock,
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
  const outerWrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTimestampSeconds);
  const [duration, setDuration] = useState(0);
  const [resumedNotice, setResumedNotice] = useState<string | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [useFallbackIframe, setUseFallbackIframe] = useState(false);

  // Instant hover state — controls show immediately on hover, hide immediately on mouse leave
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 50% watch time tracking and auto-completion
  const [maxWatchedSeconds, setMaxWatchedSeconds] = useState(initialTimestampSeconds || 0);
  const autoCompletedRef = useRef(isCompleted);

  // Sync state when lesson or initial timestamp changes
  useEffect(() => {
    setMaxWatchedSeconds(initialTimestampSeconds || 0);
    autoCompletedRef.current = isCompleted;
  }, [lesson.id, initialTimestampSeconds, isCompleted]);

  // Keep track of maximum reached seconds
  useEffect(() => {
    if (currentTime > maxWatchedSeconds) {
      setMaxWatchedSeconds(currentTime);
    }
  }, [currentTime, maxWatchedSeconds]);

  const highestSeconds = Math.max(currentTime, maxWatchedSeconds);
  const watchPercent = duration > 0 ? (highestSeconds / duration) * 100 : 0;
  const isUnlocked = isCompleted || (duration > 0 && highestSeconds / duration >= 0.5);

  // Auto mark class as completed when 50% watched
  useEffect(() => {
    if (isUnlocked && !autoCompletedRef.current) {
      autoCompletedRef.current = true;
      onToggleComplete();
    }
  }, [isUnlocked, onToggleComplete]);

  const canGoNext = hasNext && isUnlocked;

  // Guaranteed valid media resolution
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

  // Listen to browser fullscreen change
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, []);

  // Initialize or update YouTube Player
  useEffect(() => {
    if (media.type !== "video" || !media.videoId) return;
    if (!apiReady || useFallbackIframe || !containerRef.current) return;

    // Clear previous timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const playerId = `yt-player-${lesson.id}`;
    containerRef.current.innerHTML = `<div id="${playerId}" class="w-full h-full rounded-2xl pointer-events-auto"></div>`;

    try {
      playerRef.current = new window.YT.Player(playerId, {
        videoId: media.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0, // controls: 0 removes YouTube's lingering native overlay, next/prev video buttons, and playlist drawer
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          disablekb: 1, // Disables keyboard skipping to next video (like Shift+N)
          fs: 0,
          iv_load_policy: 3, // Disables YouTube video cards & annotations to prevent jumping to external/other videos
          start: initialTimestampSeconds > 5 ? Math.floor(initialTimestampSeconds) : 0,
        },
        events: {
          onReady: (event: any) => {
            const playerDuration = event.target.getDuration();
            setDuration(playerDuration);

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

              // Update timer every 500ms for smooth progress bar updates
              timerRef.current = setInterval(() => {
                if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                  const currentSecs = playerRef.current.getCurrentTime();
                  setCurrentTime(currentSecs);
                  onTimeUpdateRef.current(currentSecs);
                }
              }, 500);
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

  // Player controls handlers
  const handleTogglePlay = useCallback(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (err) {
      console.warn("Toggle play error:", err);
    }
  }, [isPlaying]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!playerRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const targetSeconds = fraction * duration;
    try {
      playerRef.current.seekTo(targetSeconds, true);
      setCurrentTime(targetSeconds);
      onTimeUpdateRef.current(targetSeconds);
    } catch {}
  };

  const handleRewind10 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    const target = Math.max(0, currentTime - 10);
    try {
      playerRef.current.seekTo(target, true);
      setCurrentTime(target);
      onTimeUpdateRef.current(target);
    } catch {}
  };

  const handleForward10 = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    const target = Math.min(duration || Infinity, currentTime + 10);
    try {
      playerRef.current.seekTo(target, true);
      setCurrentTime(target);
      onTimeUpdateRef.current(target);
    } catch {}
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {}
  };

  const speeds = [1, 1.25, 1.5, 2];
  const handleToggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    try {
      playerRef.current.setPlaybackRate(nextSpeed);
      setPlaybackRate(nextSpeed);
    } catch {}
  };

  const handleToggleFullscreen = () => {
    if (!outerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      outerWrapperRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard navigation shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === "Space") {
      e.preventDefault();
      handleTogglePlay();
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      if (playerRef.current) {
        const target = Math.max(0, currentTime - 10);
        playerRef.current.seekTo(target, true);
        setCurrentTime(target);
      }
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      if (playerRef.current) {
        const target = Math.min(duration || Infinity, currentTime + 10);
        playerRef.current.seekTo(target, true);
        setCurrentTime(target);
      }
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      handleToggleFullscreen();
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      handleToggleMute(e as any);
    }
  };

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isPlaying) {
      idleTimerRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 3000);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Video Container — Supports Instant Hover show/hide */}
      <div
        ref={outerWrapperRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          setIsHovered(true);
          resetIdleTimer();
        }}
        onMouseMove={() => {
          setIsHovered(true);
          resetIdleTimer();
        }}
        onMouseLeave={() => {
          // INSTANTLY hide controls when mouse leaves the player (0ms delay)
          setIsHovered(false);
          if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        }}
        className="relative aspect-video w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-950 shadow-md group select-none focus:outline-none"
      >
        {/* The YouTube iframe or fallback */}
        {useFallbackIframe ? (
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

        {/* CUSTOM CONTROLS OVERLAY: Secure, instant hover, no YouTube next/prev buttons */}
        {!useFallbackIframe && (
          <>
            {/* Center Click Canvas: click to play/pause, double-click for fullscreen */}
            <div
              className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
              onClick={handleTogglePlay}
              onDoubleClick={handleToggleFullscreen}
            >
              {/* Big Center Play / Pause Indicator — instantly shows on hover, hides on mouseLeave */}
              <div
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-900/80 text-white backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20 transition-all duration-100 transform ${
                  isHovered
                    ? "opacity-95 scale-100 hover:scale-110 hover:opacity-100"
                    : "opacity-0 scale-90 pointer-events-none"
                }`}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 sm:h-9 sm:w-9 fill-current" />
                ) : (
                  <Play className="h-8 w-8 sm:h-9 sm:w-9 fill-current ml-1" />
                )}
              </div>
            </div>

            {/* Top Bar Overlay: Immediately hides on mouseLeave (0 delay) */}
            <div
              className={`absolute top-0 inset-x-0 z-20 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-100 ${
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="text-white text-xs sm:text-sm font-semibold truncate drop-shadow-sm">
                  {lesson.title}
                </span>
              </div>
            </div>

            {/* Bottom Controls Overlay: Immediately hides on mouseLeave (0 delay) */}
            <div
              className={`absolute bottom-0 inset-x-0 z-20 pt-8 pb-3 px-3 sm:px-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex flex-col gap-2 transition-opacity duration-100 ${
                isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Interactive Timeline Scrubber */}
              <div
                className="relative w-full h-3 group/scrubber cursor-pointer flex items-center"
                onClick={handleSeek}
              >
                {/* Background Track */}
                <div className="w-full h-1 group-hover/scrubber:h-1.5 rounded-full bg-white/25 transition-all overflow-hidden relative">
                  {/* Progress Fill */}
                  <div
                    className="h-full bg-accent-500 rounded-full relative"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {/* Scrubber Knob */}
                <div
                  className="absolute h-3.5 w-3.5 rounded-full bg-white shadow-md border-2 border-accent-500 -ml-1.5 opacity-0 group-hover/scrubber:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>

              {/* Controls Bar Items */}
              <div className="flex items-center justify-between text-white text-xs pt-0.5">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Play / Pause Button */}
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-white"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Rewind 10s */}
                  <button
                    type="button"
                    onClick={handleRewind10}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-slate-300 hover:text-white"
                    title="Rewind 10s (←)"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  {/* Forward 10s */}
                  <button
                    type="button"
                    onClick={handleForward10}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-slate-300 hover:text-white"
                    title="Forward 10s (→)"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>

                  {/* Mute / Unmute */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-slate-300 hover:text-white"
                    title={isMuted ? "Unmute (m)" : "Mute (m)"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-rose-400" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>

                  {/* Time Counter */}
                  <span className="font-mono text-[11px] sm:text-xs text-slate-300 tabular-nums">
                    {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Playback Speed */}
                  <button
                    type="button"
                    onClick={handleToggleSpeed}
                    className="px-2 py-0.5 rounded-md text-[11px] font-bold font-mono bg-white/10 hover:bg-white/20 transition-colors text-slate-200 cursor-pointer"
                    title="Playback speed"
                  >
                    {playbackRate}x
                  </button>

                  {/* Fullscreen Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-slate-300 hover:text-white"
                    title={isFullscreen ? "Exit Fullscreen (f)" : "Fullscreen (f)"}
                  >
                    {isFullscreen ? (
                      <Minimize className="h-4 w-4" />
                    ) : (
                      <Maximize className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Resumed timestamp notice */}
        {resumedNotice && (
          <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-slate-900/95 text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium shadow-md border border-white/10 animate-fade-in">
            <RotateCcw className="h-3.5 w-3.5 text-accent-400" />
            <span>{resumedNotice}</span>
          </div>
        )}
      </div>

      {/* Mode Status / Fallback Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {media.isFallback ? (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              Featuring foundational course lecture • You can also watch additional episodes on our channel.
            </span>
            <a
              href={lesson.youtubeUrl || "https://youtube.com/@AutoAIAcademy"}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline ml-1 inline-flex items-center gap-0.5"
            >
              <span>Channel</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        ) : (
          <div className="text-slate-400 text-[11px]">
            Hover to view controls • Move mouse away to immediately hide
          </div>
        )}
      </div>

      {/* Action Controls & Navigation Bar */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Previous Class Button with Tooltip */}
        <div className="relative group/prev">
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasPrevious}
            onClick={onPreviousLesson}
            className={`rounded-lg px-3.5 font-medium flex items-center gap-1.5 transition-colors ${
              hasPrevious
                ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                : "cursor-not-allowed opacity-50 text-slate-400 dark:text-slate-500"
            }`}
            title={hasPrevious ? "Previous Class" : "Pehle koi class nahi hai"}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous Class</span>
            <span className="sm:hidden">Prev Class</span>
          </Button>

          {/* Tooltip on hover when no previous class */}
          {!hasPrevious && (
            <div className="pointer-events-none absolute bottom-full left-0 mb-2 hidden group-hover/prev:flex flex-col items-start z-50 w-60">
              <div className="bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg shadow-xl border border-slate-700/80 leading-snug">
                Yeh pehli class hai, is se pehle koi class nahi hai.
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 ml-4 border-r border-b border-slate-700/80" />
            </div>
          )}
        </div>

        {/* Center: Automatic Completion Badge (Manual Button Removed) */}
        <div className="flex items-center">
          {isUnlocked ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold select-none shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Class Completed (Auto)</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium select-none"
              title="Class 50% dekhne par automatically complete ho jayegi"
            >
              <div className="h-2 w-2 rounded-full bg-accent-500 animate-pulse" />
              <span>
                Progress: <strong className="font-semibold text-slate-900 dark:text-slate-100">{Math.min(50, Math.round(watchPercent))}%</strong> / 50% to complete
              </span>
            </div>
          )}
        </div>

        {/* Next Class Button with 50% Requirement Tooltip */}
        <div className="relative group/next">
          <Button
            size="sm"
            disabled={!canGoNext}
            onClick={onNextLesson}
            className={`rounded-lg px-4 font-medium flex items-center gap-1.5 transition-all ${
              canGoNext
                ? "bg-accent-600 hover:bg-accent-700 text-white cursor-pointer shadow-sm hover:shadow"
                : "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-800 cursor-not-allowed opacity-60"
            }`}
            title={
              canGoNext
                ? "Next Class"
                : !isUnlocked
                ? "Agli class unlock karne ke liye is lecture ko kam az kam 50% dekhna lazmi hai"
                : "Aap is course ki aakhri class par hain"
            }
          >
            <span>Next Class</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Tooltip on hover when disabled */}
          {!canGoNext && (
            <div className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover/next:flex flex-col items-end z-50 w-72 text-right">
              <div className="bg-slate-900 text-white text-[11px] font-medium px-3 py-2 rounded-lg shadow-xl border border-slate-700/80 leading-snug">
                {!isUnlocked ? (
                  <span>
                    Agli class unlock karne ke liye is lecture ko kam az kam <strong>50% dekhna lazmi hai</strong>. (Current: {Math.round(watchPercent)}% / 50%)
                  </span>
                ) : (
                  <span>Aap is course ki aakhri class par hain. Mazeed koi class nahi hai.</span>
                )}
              </div>
              <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 mr-4 border-r border-b border-slate-700/80" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
