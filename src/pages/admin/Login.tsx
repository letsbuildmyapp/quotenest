import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner';
import { auth } from '../../lib/firebase';
import { Logo } from '../../components/Logo';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@quotenest.test');
  const [password, setPassword] = useState('quotenest-admin');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch {
        // Try to create the user (fine in emulator/dev)
        await createUserWithEmailAndPassword(auth, email, password);
      }
      toast.success('Signed in');
      nav('/admin');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-ink-200/60 bg-cream/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="pill bg-ink-100 text-xs">Admin</span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-16">
        <div className="card p-8">
          <h1 className="display text-3xl font-bold">Admin sign-in</h1>
          <p className="mt-1 text-ink-600 text-sm">
            Demo credentials are pre-filled. The account will be created automatically on first sign-in.
          </p>
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </div>
      </main>
    </div>
  );
}
