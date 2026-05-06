import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/quiz/ProgressBar';
import { StepRenderer } from '../components/quiz/StepRenderer';
import { ContactStep, type ContactFormValues } from '../components/quiz/ContactStep';
import { Logo } from '../components/Logo';
import { useQuiz } from '../store/quizStore';
import { STEPS, FIRST_STEP_ID, chainFrom } from '../quiz/schema';
import { calculateEstimate, scoreLead } from '../quiz/estimate';
import { createLead } from '../lib/leads';
import { decodeAnswers, encodeAnswers } from '../lib/share';

export default function Quiz() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { currentId, history, answers, setAnswer, goNext, goBack, reset, hydrateFromShared } = useQuiz();
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from shared link if present (?a=...)
  useEffect(() => {
    const a = params.get('a');
    if (a) {
      const parsed = decodeAnswers(a);
      if (parsed) hydrateFromShared(parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = STEPS[currentId];

  const projectedChain = useMemo(() => chainFrom(FIRST_STEP_ID, answers), [answers]);
  const idx = projectedChain.indexOf(currentId);
  const total = projectedChain.length;
  const progress = total <= 1 ? 0 : idx / (total - 1);

  async function handleSubmitContact(v: ContactFormValues) {
    setSubmitting(true);
    try {
      const fullAnswers = { ...answers, name: v.name, email: v.email, phone: v.phone };
      const estimate = calculateEstimate(fullAnswers);
      const { score, value } = scoreLead(fullAnswers, estimate);
      const leadInput = {
        name: v.name,
        email: v.email,
        phone: v.phone,
        zip: String(answers.zip ?? ''),
        answers: fullAnswers,
        estimate,
        score,
        scoreValue: value,
        status: 'new' as const,
        source: 'quiz_landing',
      };
      const { id } = await createLead(leadInput);
      toast.success('Estimate ready — sending email now.');
      // Mock SMS
      console.info(`[QuoteNest][SMS-mock] To: ${v.phone} — Hi ${v.name.split(' ')[0]}, your QuoteNest estimate is ready: $${estimate.low.toLocaleString()}–$${estimate.high.toLocaleString()}. Reply STOP to opt out.`);
      const shareCode = encodeAnswers(fullAnswers);
      nav(`/result?lead=${id}&a=${shareCode}`);
    } catch (e: any) {
      console.error(e);
      toast.error('Something went sideways. Try again?');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8 md:py-14">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (history.length > 1 ? goBack() : nav('/'))}
            className="btn-ghost text-sm"
          >
            ← Back
          </button>
          <p className="text-xs font-semibold text-ink-500">
            Step {idx + 1} of {total}
          </p>
          <button
            type="button"
            onClick={() => { reset(); toast('Quiz reset.'); }}
            className="btn-ghost text-sm"
          >
            Reset
          </button>
        </div>
        <ProgressBar value={progress} />

        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            >
              <div className="text-center">
                {step.illustration && (
                  <span className="inline-block text-5xl md:text-6xl mb-4 animate-float">{step.illustration}</span>
                )}
                <h1 className="display text-3xl md:text-4xl font-bold leading-tight">{step.title}</h1>
                {step.subtitle && <p className="mt-2 text-ink-600">{step.subtitle}</p>}
              </div>
              <div className="mt-8">
                {step.kind === 'contact' ? (
                  <ContactStep onSubmit={handleSubmitContact} isSubmitting={submitting} />
                ) : (
                  <StepRenderer step={step} answers={answers} onAnswer={setAnswer} onNext={goNext} />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-10 text-center text-xs text-ink-600">
          Built by <Logo className="text-ink-500" /> — your answers stay on this device until you submit.
        </p>
      </main>
    </div>
  );
}
