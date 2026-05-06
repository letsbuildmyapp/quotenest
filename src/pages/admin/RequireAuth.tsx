import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null | 'loading'>('loading');
  const loc = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (user === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center text-ink-500">
        <div className="animate-pulse">Loading…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}
