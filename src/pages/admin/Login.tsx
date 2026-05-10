import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner';
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { auth } from '../../lib/firebase';

const DEMO_LOGINS = [
  {
    email: 'admin@quotenest.test',
    password: 'quotenest-admin',
    label: 'Admin',
    description: 'Quote management & site config',
    icon: ShieldCheck,
    color: 'from-indigo-500 to-violet-500',
  },
];

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function attemptSignIn(em: string, pw: string) {
    try {
      await signInWithEmailAndPassword(auth, em, pw);
    } catch {
      await createUserWithEmailAndPassword(auth, em, pw);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await attemptSignIn(email, password);
      toast.success('Signed in');
      nav('/admin');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  async function onDemoLogin(d: (typeof DEMO_LOGINS)[number]) {
    setEmail(d.email);
    setPassword(d.password);
    setDemoLoading(d.email);
    try {
      await attemptSignIn(d.email, d.password);
      toast.success(`Signed in as ${d.label}`);
      nav('/admin');
    } catch (e: any) {
      toast.error(e?.message ?? 'Sign-in failed');
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">

      <main className="relative z-10 flex flex-1 items-start justify-center px-6 pt-8 sm:pt-12 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px]"
        >
          <div className="card p-8 shadow-2xl">
            <div className="space-y-1.5">
              <h1 className="display text-2xl font-bold">Sign in to QuoteNest</h1>
              <p className="text-sm text-ink-600">Account is created automatically on first sign-in.</p>
            </div>

            <div className="my-6 grid gap-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                  One-click demo logins
                </span>
                <span className="text-[10px] text-ink-500">No password needed</span>
              </div>
              {DEMO_LOGINS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => onDemoLogin(d)}
                  disabled={demoLoading !== null || loading}
                  className="group flex items-center gap-3 rounded-md border border-ink-200/70 bg-cream/50 p-3 text-left transition-all hover:border-ink-400 hover:bg-cream disabled:opacity-50"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${d.color} text-white shadow-sm`}>
                    <d.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="truncate text-xs text-ink-600">{d.description}</div>
                  </div>
                  {demoLoading === d.email ? (
                    <Loader2 className="h-4 w-4 animate-spin text-ink-500" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-ink-500 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-ink-200/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-cream px-3 text-ink-600">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4">
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@quotenest.test" />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <button className="btn-primary" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Sign in'}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 px-6 pb-8 text-center text-xs text-ink-500 sm:px-10">
        <a
          href="https://letsbuildmyapp.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ink underline-offset-4 hover:underline"
        >
          Let&apos;s Build My App
        </a>
      </footer>
    </div>
  );
}
