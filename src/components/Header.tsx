import { Link, NavLink } from 'react-router-dom';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink-900/10 backdrop-blur-md bg-cream/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" className="btn-ghost rounded-full px-4 py-2 text-sm">How it works</NavLink>
          <a href="#faq" className="btn-ghost rounded-full px-4 py-2 text-sm">FAQ</a>
          <NavLink to="/admin" className="btn-ghost rounded-full px-4 py-2 text-sm">Admin</NavLink>
        </nav>
        <Link to="/quiz" className="btn-accent text-sm md:text-base">Get a quote →</Link>
      </div>
    </header>
  );
}
