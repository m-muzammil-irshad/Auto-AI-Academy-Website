/**
 * YouTube utility helpers for extracting video IDs, playlists, and formatting playback time.
 */

export function extractYouTubeVideoId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already an 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    // Try URL search param "v" first (handles query parameter order)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      if (url.searchParams.has("v")) {
        const v = url.searchParams.get("v");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      }
    }

    // Patterns for various YouTube URL structures (watch, embed, live, shorts, youtu.be)
    const pattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  } catch {
    // ignore URL parsing error
  }

  return null;
}

export function extractYouTubePlaylistId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  let candidate: string | null = null;

  // If already a valid playlist ID (Standard YouTube PL playlists are 34 chars; legacy >= 18 chars)
  if (/^(?:PL[a-zA-Z0-9_-]{16,}|UU[a-zA-Z0-9_-]{22}|FL[a-zA-Z0-9_-]{22}|RD[a-zA-Z0-9_-]{11,}|OLAK5uy_[a-zA-Z0-9_-]{33})$/i.test(trimmed)) {
    candidate = trimmed;
  } else {
    try {
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const url = new URL(trimmed);
        if (url.searchParams.has("list")) {
          const list = url.searchParams.get("list");
          if (list) candidate = list;
        }
      }
    } catch {
      // ignore
    }

    if (!candidate) {
      const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) {
        candidate = match[1];
      }
    }
  }

  // Strictly validate candidate:
  // Short/corrupt strings like "PLexmcs4V1xjc" (12 chars) or "PLUjGR1B0HaJw" (12 chars) are invalid and cause YouTube "Video unavailable" errors.
  if (candidate) {
    if (candidate.startsWith("PL") && candidate.length < 18) {
      return null;
    }
    if (/^[a-zA-Z0-9_-]{16,}$/.test(candidate) || candidate.startsWith("UU") || candidate.startsWith("RD") || candidate.startsWith("FL")) {
      return candidate;
    }
  }

  return null;
}

export interface PlayableMedia {
  type: "video" | "playlist";
  videoId?: string;
  playlistId?: string;
  src: string;
  isFallback: boolean;
}

/**
 * Resolves a reliable, playable media object from any YouTube URL, playlist, channel, or topic.
 * Guaranteed to NEVER return empty so student video playback never fails.
 */
export function resolvePlayableMedia(
  urlOrId?: string | null,
  courseTitle?: string,
  lessonTitle?: string
): PlayableMedia {
  const trimmed = (urlOrId || "").trim();

  // 1. Direct YouTube Video ID
  const directVideoId = extractYouTubeVideoId(trimmed);
  if (directVideoId) {
    return {
      type: "video",
      videoId: directVideoId,
      src: `https://www.youtube-nocookie.com/embed/${directVideoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`,
      isFallback: false,
    };
  }

  // 2. Direct YouTube Playlist ID
  const directPlaylistId = extractYouTubePlaylistId(trimmed);
  if (directPlaylistId) {
    return {
      type: "playlist",
      playlistId: directPlaylistId,
      src: `https://www.youtube-nocookie.com/embed/videoseries?list=${directPlaylistId}&rel=0&modestbranding=1&playsinline=1`,
      isFallback: false,
    };
  }

  // 3. YouTube Channel ID (channel/UC...) -> upload playlist UU...
  const channelMatch = trimmed.match(/channel\/(UC[a-zA-Z0-9_-]{22})/i);
  if (channelMatch && channelMatch[1]) {
    const uploadPlaylistId = "UU" + channelMatch[1].slice(2);
    return {
      type: "playlist",
      playlistId: uploadPlaylistId,
      src: `https://www.youtube-nocookie.com/embed/videoseries?list=${uploadPlaylistId}&rel=0&modestbranding=1&playsinline=1`,
      isFallback: false,
    };
  }

  // 4. Smart Topic Fallback
  // If the course or lesson is related to n8n, Python, or AI automation,
  // load a curated, universally embeddable full course video from Auto AI Academy so the student can start learning immediately.
  const combined = `${trimmed} ${courseTitle || ""} ${lessonTitle || ""}`.toLowerCase();
  let fallbackId = "sNfwc0tNjAI"; // Auto AI Academy: Python Tutorial for Beginners | Lecture 1

  if (combined.includes("n8n") || combined.includes("automat")) {
    fallbackId = "FzzNvpGd2dM"; // Auto AI Academy: n8n Course for Beginners | Lecture 1
  } else if (combined.includes("agent") || combined.includes("ai") || combined.includes("llm")) {
    fallbackId = "KyOd26mJ8DQ"; // Auto AI Academy: AI vs Automation | Lecture 2
  }

  return {
    type: "video",
    videoId: fallbackId,
    src: `https://www.youtube-nocookie.com/embed/${fallbackId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`,
    isFallback: true,
  };
}

export function formatVideoTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  if (hrs > 0) {
    const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
    return `${hrs}:${minsStr}:${secsStr}`;
  }
  return `${mins}:${secsStr}`;
}
