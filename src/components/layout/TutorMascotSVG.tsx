export function TutorMascotSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" /> {/* Teal 400 */}
          <stop offset="100%" stopColor="#0ea5e9" /> {/* Sky 500 */}
        </linearGradient>
        <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#cffafe" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Antennas */}
      <path
        d="M30 25 L20 10"
        stroke="url(#headGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="18" cy="8" r="4" fill="#2dd4bf" filter="url(#glow)" />

      <path
        d="M70 25 L80 10"
        stroke="url(#headGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="82" cy="8" r="4" fill="#0ea5e9" filter="url(#glow)" />

      {/* Main Head */}
      <rect
        x="10"
        y="20"
        width="80"
        height="70"
        rx="35"
        fill="url(#headGrad)"
        stroke="#ffffff"
        strokeWidth="2"
      />

      {/* Screen / Visor */}
      <rect
        x="20"
        y="35"
        width="60"
        height="35"
        rx="15"
        fill="#0f172a" /* slate-900 */
        stroke="#1e293b"
        strokeWidth="2"
      />

      {/* Eyes */}
      <circle cx="35" cy="50" r="7" fill="url(#eyeGrad)" filter="url(#glow)" />
      {/* Eye shine */}
      <circle cx="33" cy="48" r="2" fill="#ffffff" />

      <circle cx="65" cy="50" r="7" fill="url(#eyeGrad)" filter="url(#glow)" />
      {/* Eye shine */}
      <circle cx="63" cy="48" r="2" fill="#ffffff" />

      {/* Cute Smile */}
      <path
        d="M45 60 Q50 65 55 60"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
      />
    </svg>
  );
}
