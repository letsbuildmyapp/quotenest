import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

export default function NotFound() {
  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="text-7xl animate-wiggle inline-block">🪺</div>
        <h1 className="display mt-6 text-6xl font-bold">404</h1>
        <p className="mt-2 text-ink-600">This nest is empty. The page you're looking for flew off.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-primary">Back home</Link>
          <Link to="/quiz" className="btn-accent">Take the quiz instead</Link>
        </div>
      </main>
    </div>
  );
}
