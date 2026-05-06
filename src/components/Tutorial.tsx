import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Kanban,
  Filter,
  IdCard,
  Download,
  PartyPopper,
} from 'lucide-react';
import { auth } from '../lib/firebase';

const TUTORIAL_KEY_PREFIX = 'quotenest:tutorial_seen:';
const ROLE = 'admin';
const MOBILE_BREAKPOINT = 768;

type Step = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: React.ReactNode;
  /** data-tour attribute on the target element. Omit for centered (welcome / final). */
  target?: string;
  /** Preferred placement of the tooltip relative to the target. */
  placement?: 'right' | 'left' | 'top' | 'bottom';
};

const ADMIN_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: 'Welcome to QuoteNest',
    body: (
      <>
        Your nest of solar leads, hatched from the public quiz. Take{' '}
        <span className="font-semibold text-ink-900">30 seconds</span> to see how the
        admin pipeline flies.
      </>
    ),
  },
  {
    icon: Kanban,
    title: 'Lead pipeline kanban',
    body: (
      <>
        Every quiz submission lands in <span className="font-semibold text-ink-900">New</span>.
        Move leads forward — Contacted → Qualified — and out to{' '}
        <span className="font-semibold text-ink-900">Won</span> or{' '}
        <span className="font-semibold text-ink-900">Lost</span> — with the arrow buttons on
        each card.
      </>
    ),
    target: 'kanban',
    placement: 'top',
  },
  {
    icon: Filter,
    title: 'Search & score filter',
    body: (
      <>
        Search by name, email, or ZIP. Filter by score —{' '}
        <span className="font-semibold text-red-700">hot</span>,{' '}
        <span className="font-semibold text-sun-700">warm</span>, or{' '}
        <span className="font-semibold text-grape-700">cold</span> — to triage the queue
        fast.
      </>
    ),
    target: 'filters',
    placement: 'bottom',
  },
  {
    icon: IdCard,
    title: 'Open a lead drawer',
    body: 'Click any lead name to see the full quiz answers, system estimate, score breakdown, and editable internal notes (auto-saved on blur).',
    target: 'kanban',
    placement: 'top',
  },
  {
    icon: Download,
    title: 'Export to CSV',
    body: 'One click pulls the current filtered view into a CSV — perfect for handing the warm list to your sales team or pasting into a spreadsheet.',
    target: 'export',
    placement: 'left',
  },
  {
    icon: PartyPopper,
    title: "You're all set.",
    body: (
      <>
        Take the public quiz at <span className="font-semibold text-ink-900">/</span> to generate a
        real lead, or use the seeded demo data already in the pipeline. Built by{' '}
        <a href="https://letsbuildmyapp.com" className="font-semibold text-grape-600 underline">
          letsbuildmyapp.com
        </a>
        .
      </>
    ),
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function Tutorial() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth < MOBILE_BREAKPOINT,
  );

  // Track auth — tour is admin-only. If not signed in, never show.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const STEPS = useMemo<Step[]>(() => ADMIN_STEPS, []);

  // First-run check — per role, per device
  useEffect(() => {
    if (!user) {
      setOpen(false);
      return;
    }
    const seen = localStorage.getItem(TUTORIAL_KEY_PREFIX + ROLE);
    setOpen(!seen);
    setStep(0);
  }, [user]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const close = useCallback(() => {
    localStorage.setItem(TUTORIAL_KEY_PREFIX + ROLE, '1');
    setOpen(false);
  }, []);

  const next = useCallback(() => {
    setStep((s) => {
      if (s < STEPS.length - 1) return s + 1;
      close();
      return s;
    });
  }, [close, STEPS.length]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        back();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close, next, back]);

  const currentStep = STEPS[step];
  const targetSel = currentStep.target;

  useLayoutEffect(() => {
    if (!open || isMobile || !targetSel) {
      setRect(null);
      return;
    }
    const compute = () => {
      const el = document.querySelector(`[data-tour="${targetSel}"]`) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    compute();
    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open, isMobile, targetSel, step]);

  if (!user || !open) return null;

  const hasTarget = !!rect && !!targetSel;
  if (isMobile || !hasTarget) {
    return (
      <CenteredModal
        steps={STEPS}
        step={step}
        onClose={close}
        onNext={next}
        onBack={back}
        onJump={setStep}
      />
    );
  }

  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;

  // Tooltip placement
  const PAD = 18;
  const TOOLTIP_W = 380;
  const TOOLTIP_H_EST = 320;
  let top = 0;
  let left = 0;
  if (rect) {
    const placement = currentStep.placement ?? 'right';
    if (placement === 'right') {
      left = rect.left + rect.width + PAD;
      top = rect.top;
      if (left + TOOLTIP_W > window.innerWidth - PAD) {
        left = rect.left;
        top = rect.top + rect.height + PAD;
      }
    } else if (placement === 'left') {
      left = rect.left - TOOLTIP_W - PAD;
      top = rect.top;
      if (left < PAD) {
        left = rect.left;
        top = rect.top + rect.height + PAD;
      }
    } else if (placement === 'bottom') {
      left = rect.left;
      top = rect.top + rect.height + PAD;
    } else if (placement === 'top') {
      left = rect.left;
      top = rect.top - TOOLTIP_H_EST - PAD;
      if (top < PAD) {
        top = rect.top + rect.height + PAD;
      }
    }
    left = Math.min(Math.max(PAD, left), window.innerWidth - TOOLTIP_W - PAD);
    top = Math.min(Math.max(PAD, top), window.innerHeight - TOOLTIP_H_EST - PAD);
  }
  const tipStyle: React.CSSProperties = { top, left };

  return (
    <AnimatePresence>
      <motion.div
        key="spot-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onClick={close}
      >
        {hasTarget && rect ? (
          <motion.div
            initial={false}
            animate={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
            }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="absolute rounded-3xl pointer-events-none"
            style={{
              boxShadow:
                '0 0 0 9999px rgba(21,21,27,0.72), 0 0 0 3px #ff9d3a, 0 0 0 6px rgba(255,157,58,0.25)',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-ink-900/72 backdrop-blur-sm" />
        )}
      </motion.div>

      {/* Tooltip card — playful, hard offset shadow */}
      <motion.div
        key={`tip-${step}`}
        initial={{ opacity: 0, y: 12, scale: 0.96, rotate: -1 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="fixed z-[101] w-[380px] rounded-3xl border-2 border-ink-900 bg-cream overflow-hidden"
        style={{ ...tipStyle, boxShadow: '6px 6px 0 0 #ff9d3a' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 h-12 border-b-2 border-ink-900 bg-white">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
            Tour · <span className="tabular-nums">{step + 1}</span> of{' '}
            <span className="tabular-nums">{STEPS.length}</span>
          </span>
          <button
            onClick={close}
            className="grid place-items-center h-8 w-8 rounded-full border-2 border-ink-900 bg-white hover:bg-sun-100 text-ink-900 transition-colors"
            aria-label="Close tour"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-5">
          <motion.div
            initial={{ rotate: -6, scale: 0.85 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.05 }}
            className="h-12 w-12 rounded-2xl border-2 border-ink-900 bg-sun-300 grid place-items-center mb-4 shadow-[3px_3px_0_0_#15151b]"
          >
            <Icon size={22} className="text-ink-900" />
          </motion.div>
          <h2
            id="tutorial-title"
            className="font-display text-2xl font-bold tracking-tight text-ink-900 leading-tight"
          >
            {currentStep.title}
          </h2>
          <div className="text-sm text-ink-700 mt-2 leading-relaxed">{currentStep.body}</div>
        </div>

        <div className="flex items-center justify-between px-4 h-14 border-t-2 border-ink-900 bg-white">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={
                  i === step
                    ? 'h-2 w-6 rounded-full bg-ink-900 transition-all'
                    : 'h-2 w-2 rounded-full bg-ink-300 hover:bg-ink-500 transition-all'
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                onClick={back}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-full text-xs font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 transition-colors"
              >
                <ArrowLeft size={13} /> Back
              </button>
            ) : (
              <button
                onClick={close}
                className="inline-flex items-center h-9 px-3 rounded-full text-xs font-semibold text-ink-500 hover:text-ink-900 transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={next}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-bold bg-sun-400 text-ink-900 border-2 border-ink-900 shadow-[2px_2px_0_0_#15151b] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_#15151b] transition-all"
            >
              {isLast ? 'Done' : 'Next'} {!isLast ? <ArrowRight size={13} strokeWidth={2.5} /> : null}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CenteredModal({
  steps,
  step,
  onClose,
  onNext,
  onBack,
  onJump,
}: {
  steps: Step[];
  step: number;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  onJump: (i: number) => void;
}) {
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-items-center px-4 py-8 bg-ink-900/72 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, y: 20, scale: 0.94, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="w-full max-w-md rounded-3xl border-2 border-ink-900 bg-cream overflow-hidden"
          style={{ boxShadow: '6px 6px 0 0 #ff9d3a' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 h-12 border-b-2 border-ink-900 bg-white">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-700">
              Tour · <span className="tabular-nums">{step + 1}</span> of{' '}
              <span className="tabular-nums">{steps.length}</span>
            </span>
            <button
              onClick={onClose}
              className="grid place-items-center h-8 w-8 rounded-full border-2 border-ink-900 bg-white hover:bg-sun-100 text-ink-900 transition-colors"
              aria-label="Close tour"
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>
          <div className="p-6">
            <motion.div
              initial={{ rotate: -8, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.05 }}
              className="h-14 w-14 rounded-2xl border-2 border-ink-900 bg-sun-300 grid place-items-center mb-4 shadow-[3px_3px_0_0_#15151b]"
            >
              <Icon size={26} className="text-ink-900" />
            </motion.div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink-900 leading-tight">
              {current.title}
            </h2>
            <div className="text-base text-ink-700 mt-3 leading-relaxed">{current.body}</div>
          </div>
          <div className="flex items-center justify-between px-4 h-14 border-t-2 border-ink-900 bg-white">
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={
                    i === step
                      ? 'h-2 w-6 rounded-full bg-ink-900 transition-all'
                      : 'h-2 w-2 rounded-full bg-ink-300 hover:bg-ink-500 transition-all'
                  }
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-full text-sm font-semibold text-ink-700 hover:text-ink-900 hover:bg-ink-100 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="inline-flex items-center h-9 px-3 rounded-full text-sm font-semibold text-ink-500 hover:text-ink-900 transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={onNext}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-sm font-bold bg-sun-400 text-ink-900 border-2 border-ink-900 shadow-[2px_2px_0_0_#15151b] hover:-translate-y-[1px] hover:shadow-[3px_3px_0_0_#15151b] transition-all"
              >
                {isLast ? 'Done' : 'Next'}{' '}
                {!isLast ? <ArrowRight size={14} strokeWidth={2.5} /> : null}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
