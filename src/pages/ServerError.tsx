import { Link, useRouteError } from 'react-router-dom';
import { Header } from '../components/Header';

export default function ServerError() {
  const err = useRouteError() as Error;
  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-7xl inline-block">🌧️</div>
        <h1 className="display mt-6 text-5xl font-bold">Well, that's not great.</h1>
        <p className="mt-2 text-ink-600">Something on our end glitched. We're already on it.</p>
        {err?.message && <p className="mt-3 text-xs text-ink-400 font-mono">{err.message}</p>}
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-primary">Take me home</Link>
          <button className="btn-accent" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
    </div>
  );
}
