/** Hand-rolled SVG spot illustrations — keeps the playful style consistent. */
export function SunHouse({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} role="img" aria-label="Sunny house with solar panels">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffefd2" />
          <stop offset="1" stopColor="#fff9f1" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" rx="24" fill="url(#sky)" />
      <circle cx="252" cy="60" r="34" fill="#ff9d3a" stroke="#15151b" strokeWidth="3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
        <line key={d}
          x1={252 + Math.cos((d * Math.PI) / 180) * 44}
          y1={60 + Math.sin((d * Math.PI) / 180) * 44}
          x2={252 + Math.cos((d * Math.PI) / 180) * 56}
          y2={60 + Math.sin((d * Math.PI) / 180) * 56}
          stroke="#15151b" strokeWidth="3" strokeLinecap="round"
        />
      ))}
      {/* House */}
      <polygon points="60,140 160,70 260,140" fill="#fff" stroke="#15151b" strokeWidth="3" strokeLinejoin="round" />
      <rect x="80" y="140" width="160" height="80" fill="#fff" stroke="#15151b" strokeWidth="3" />
      <rect x="148" y="170" width="36" height="50" fill="#fb7c14" stroke="#15151b" strokeWidth="3" />
      <rect x="100" y="160" width="32" height="32" fill="#bda6ff" stroke="#15151b" strokeWidth="3" />
      <rect x="200" y="160" width="32" height="32" fill="#bda6ff" stroke="#15151b" strokeWidth="3" />
      {/* Panels */}
      <g transform="translate(110 92) rotate(-37)">
        <rect width="80" height="42" rx="3" fill="#23232b" stroke="#15151b" strokeWidth="3" />
        <line x1="0" y1="14" x2="80" y2="14" stroke="#5d5d6d" />
        <line x1="0" y1="28" x2="80" y2="28" stroke="#5d5d6d" />
        <line x1="40" y1="0" x2="40" y2="42" stroke="#5d5d6d" />
      </g>
      {/* Cloud */}
      <g fill="#fff" stroke="#15151b" strokeWidth="3">
        <circle cx="60" cy="50" r="12" />
        <circle cx="78" cy="46" r="14" />
        <circle cx="94" cy="52" r="10" />
        <rect x="58" y="50" width="40" height="10" />
      </g>
    </svg>
  );
}

export function Spark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" />
    </svg>
  );
}
