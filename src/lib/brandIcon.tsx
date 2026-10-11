/**
 * The site's small-size mark, drawn to match the YouTube channel logo:
 * a navy disc with a glowing blue ring, the white-to-blue "A", the blue
 * swoosh crossing it, and the robot peeking out between the A's legs.
 * The gears, brain and lettering of the full logo are left out because
 * they turn to noise at the 16px a browser tab gives an icon.
 *
 * Returned as plain JSX for next/og's ImageResponse (app/icon.tsx, app/apple-icon.tsx).
 */
export function brandIcon(size: number, { square = false }: { square?: boolean } = {}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        // iOS home-screen icons must be an opaque square; browser tabs get a transparent disc.
        background: square ? "#030817" : "transparent",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <defs>
          <radialGradient id="disc" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#0d1b4a" />
            <stop offset="100%" stopColor="#030817" />
          </radialGradient>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#1d6bff" />
          </linearGradient>
          <linearGradient id="letter" x1="0.3" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#e6f1ff" />
            <stop offset="100%" stopColor="#2f8bff" />
          </linearGradient>
          <linearGradient id="swoosh" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#1d6bff" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="31" fill="url(#disc)" />
        <circle cx="32" cy="32" r="29" stroke="url(#ring)" strokeWidth="4" />

        {/* The "A": solid legs, open at the bottom like the channel logo */}
        <path d="M32 8 L52.5 50 H42.5 L32 26.5 L21.5 50 H11.5 Z" fill="url(#letter)" />

        {/* Robot head between the legs, small enough to leave the A's opening visible */}
        <rect x="26.5" y="41.5" width="11" height="8.5" rx="4" fill="#ffffff" />
        <circle cx="30" cy="45.7" r="1.6" fill="#1d8bff" />
        <circle cx="34" cy="45.7" r="1.6" fill="#1d8bff" />

        {/* Swoosh crossing in front of the A */}
        <path
          d="M9.5 42.5 C 15 29, 41 24, 55 31.5"
          stroke="url(#swoosh)"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
