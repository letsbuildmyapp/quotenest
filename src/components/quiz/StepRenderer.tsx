import { useState } from 'react';
import type { Step } from '../../quiz/schema';
import type { QuizAnswers } from '../../types';

interface Props {
  step: Step;
  answers: QuizAnswers;
  onAnswer: (id: string, value: QuizAnswers[string]) => void;
  onNext: () => void;
}

export function StepRenderer({ step, answers, onAnswer, onNext }: Props) {
  if (step.kind === 'single') {
    const current = answers[step.id];
    return (
      <div className="grid gap-3">
        {step.options.map((opt) => {
          const selected = current === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onAnswer(step.id, opt.value);
                setTimeout(onNext, 220);
              }}
              className={`group flex items-center justify-between rounded-2xl border-2 border-ink-900 px-5 py-4 text-left transition-transform hover:-translate-y-[2px] ${
                selected ? 'bg-sun-400 shadow-pop' : 'bg-white shadow-pop-sm'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{opt.emoji}</span>
                <span>
                  <span className="block font-semibold text-ink-900">{opt.label}</span>
                  {opt.hint && <span className="block text-xs text-ink-600">{opt.hint}</span>}
                </span>
              </span>
              <span className="text-ink-900/60 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (step.kind === 'multi') {
    const current = (answers[step.id] as string[]) ?? [];
    const toggle = (v: string) => {
      let next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
      if (v === 'none') next = next.includes('none') ? ['none'] : next;
      else next = next.filter((x) => x !== 'none');
      onAnswer(step.id, next);
    };
    return (
      <div>
        <div className="grid gap-3">
          {step.options.map((opt) => {
            const selected = current.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={`flex items-center justify-between rounded-2xl border-2 border-ink-900 px-5 py-4 text-left transition-transform hover:-translate-y-[2px] ${
                  selected ? 'bg-grape-200 shadow-pop' : 'bg-white shadow-pop-sm'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="font-semibold text-ink-900">{opt.label}</span>
                </span>
                <span
                  className={`grid h-6 w-6 place-items-center rounded-md border-2 border-ink-900 ${selected ? 'bg-ink-900 text-cream' : 'bg-white'}`}
                  aria-hidden
                >
                  {selected ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onNext}
          disabled={current.length === 0}
          className="btn-primary mt-6 w-full"
        >
          Continue →
        </button>
      </div>
    );
  }

  if (step.kind === 'number') {
    return <NumberInput step={step} value={answers[step.id] as number | undefined} onAnswer={onAnswer} onNext={onNext} />;
  }

  if (step.kind === 'text') {
    return <TextInput step={step} value={(answers[step.id] as string) || ''} onAnswer={onAnswer} onNext={onNext} />;
  }

  if (step.kind === 'info') {
    return (
      <div>
        <p className="text-ink-700 leading-relaxed">{step.body}</p>
        <button type="button" onClick={onNext} className="btn-primary mt-6 w-full">Got it →</button>
      </div>
    );
  }

  return null; // contact handled separately by ContactStep page
}

function NumberInput({
  step, value, onAnswer, onNext,
}: { step: Extract<Step, { kind: 'number' }>; value?: number; onAnswer: Props['onAnswer']; onNext: Props['onNext']; }) {
  const [v, setV] = useState<string>(value?.toString() ?? '');
  const valid = v !== '' && Number(v) >= step.min && Number(v) <= step.max;
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (valid) { onAnswer(step.id, Number(v)); onNext(); } }}
      className="grid gap-4"
    >
      <div className="relative">
        {step.unit && <span className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-500 font-semibold">{step.unit}</span>}
        <input
          type="number"
          inputMode="numeric"
          min={step.min}
          max={step.max}
          step={step.step ?? 1}
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder={step.placeholder}
          autoFocus
          className={`input text-2xl font-bold ${step.unit ? 'pl-10' : ''}`}
        />
      </div>
      <p className="text-xs text-ink-500">Range: {step.min}{step.unit ? '' : ''}–{step.max}{step.unit ? '' : ''}</p>
      <button type="submit" disabled={!valid} className="btn-primary w-full">Continue →</button>
    </form>
  );
}

function TextInput({
  step, value, onAnswer, onNext,
}: { step: Extract<Step, { kind: 'text' }>; value: string; onAnswer: Props['onAnswer']; onNext: Props['onNext']; }) {
  const [v, setV] = useState(value);
  const valid = step.pattern ? step.pattern.test(v) : v.trim().length > 0;
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (valid) { onAnswer(step.id, v); onNext(); } }}
      className="grid gap-3"
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={step.placeholder}
        autoFocus
        className="input text-xl font-semibold"
      />
      {step.helperText && <p className="text-xs text-ink-500">{step.helperText}</p>}
      <button type="submit" disabled={!valid} className="btn-primary w-full">Continue →</button>
    </form>
  );
}
