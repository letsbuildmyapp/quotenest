import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useQuiz } from '../store/quizStore';
import { decodeAnswers } from '../lib/share';
import { calculateEstimate } from '../quiz/estimate';
import { formatCurrency } from '../lib/utils';

export default function Result() {
  const [params] = useSearchParams();
  const storeAnswers = useQuiz((s) => s.answers);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const answers = useMemo(() => {
    const a = params.get('a');
    if (a) return decodeAnswers(a) ?? storeAnswers;
    return storeAnswers;
  }, [params, storeAnswers]);

  const estimate = useMemo(() => calculateEstimate(answers), [answers]);

  const sharePath = `${window.location.origin}/result?a=${params.get('a') ?? ''}`;

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-4xl px-4 pt-8 pb-16 md:px-6 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <span className="pill bg-grape-200">✨ Your custom estimate</span>
          <h1 className="display mt-4 text-5xl md:text-7xl font-bold leading-none">
            <span className="bg-sun-300 inline-block -rotate-1 rounded-2xl px-3">
              {formatCurrency(estimate.low)}–{formatCurrency(estimate.high)}
            </span>
          </h1>
          <p className="mt-3 text-ink-600 max-w-xl mx-auto">
            Estimated installed cost <strong>after</strong> the {formatCurrency(estimate.incentiveDollars)} federal tax credit.
            Based entirely on your answers.
          </p>
        </motion.div>

        {/* Stat tiles */}
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {[
            { l: 'System size', v: `${estimate.systemSizeKw} kW`, e: '⚡' },
            { l: 'Panels', v: `${estimate.panelCount}`, e: '🔆' },
            { l: 'Annual savings', v: formatCurrency(estimate.annualSavings), e: '💸' },
            { l: 'Payback', v: `${estimate.paybackYears} yrs`, e: '📈' },
          ].map((t, i) => (
            <motion.div
              key={t.l}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="card p-5 text-center"
            >
              <div className="text-3xl">{t.e}</div>
              <p className="display text-2xl font-bold mt-1">{t.v}</p>
              <p className="text-xs text-ink-500 mt-1">{t.l}</p>
            </motion.div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="mt-10 grid gap-6 md:grid-cols-5">
          <div className="card md:col-span-3 p-6">
            <p className="display text-xl font-bold">Cost breakdown</p>
            <p className="text-xs text-ink-500 mb-4">Industry-standard cost-per-watt model. Final number set after roof inspection.</p>
            <ul className="divide-y-2 divide-dashed divide-ink-100">
              {estimate.breakdown.map((row) => (
                <li key={row.label} className="flex items-center justify-between py-3">
                  <span className="text-ink-700">{row.label}</span>
                  <span className={`font-semibold ${row.amount < 0 ? 'text-grape-700' : 'text-ink-900'}`}>
                    {row.amount < 0 ? '−' : ''}{formatCurrency(Math.abs(row.amount))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 md:col-span-2">
            <div className="card p-6 bg-sun-100">
              <p className="display text-xl font-bold">What's next</p>
              <ol className="mt-3 space-y-2 text-sm text-ink-700">
                <li>1. We just emailed you a copy of this estimate.</li>
                <li>2. A specialist will text you within 1 business day — opt out anytime.</li>
                <li>3. If you like the numbers, we send a free roof inspection.</li>
              </ol>
            </div>
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(sharePath);
                  setCopied(true);
                  toast.success('Share link copied to clipboard');
                  setTimeout(() => setCopied(false), 2200);
                } catch {
                  toast.error('Couldn\'t copy link');
                }
              }}
              className="btn-accent"
            >
              {copied ? '✓ Link copied' : '🔗 Copy shareable link'}
            </button>
            <Link to="/quiz" className="btn-ghost text-center">Edit my answers</Link>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-ink-600">
          Estimates are illustrative. Actual install pricing depends on roof inspection, electrical panel, and local rebates.
        </p>
      </main>
      <Footer />
    </div>
  );
}
