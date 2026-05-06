import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="QuoteNest home">
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-sun-400 border-2 border-ink-900 shadow-pop-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v3M4.93 4.93l2.12 2.12M2 12h3M4.93 19.07l2.12-2.12M12 19v3M19.07 19.07l-2.12-2.12M22 12h-3M19.07 4.93l-2.12 2.12" />
          <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="display text-xl font-bold">QuoteNest</span>
    </Link>
  );
}
