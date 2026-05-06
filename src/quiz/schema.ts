import type { QuizAnswers } from '../types';

/**
 * Declarative quiz schema. Each step is a node with an id, copy, an input type,
 * options (where applicable), and a `next(answers)` resolver enabling conditional
 * branching. Branching is data-driven, never hardcoded if/else trees in the UI.
 */

export type StepKind = 'single' | 'multi' | 'number' | 'text' | 'contact' | 'info';

export interface BaseStep {
  id: string;
  kind: StepKind;
  title: string;
  subtitle?: string;
  illustration?: string; // emoji-as-illustration shortcut for the playful style
  next: (a: QuizAnswers) => string | null; // null = terminal
  // Optional skip: if true for given answers, the step is skipped during traversal
  skipIf?: (a: QuizAnswers) => boolean;
}

export interface OptionStep extends BaseStep {
  kind: 'single' | 'multi';
  options: { value: string; label: string; emoji?: string; hint?: string }[];
}

export interface NumberStep extends BaseStep {
  kind: 'number';
  min: number;
  max: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

export interface TextStep extends BaseStep {
  kind: 'text';
  placeholder?: string;
  pattern?: RegExp;
  helperText?: string;
}

export interface ContactStep extends BaseStep { kind: 'contact'; }
export interface InfoStep extends BaseStep { kind: 'info'; body: string; }

export type Step = OptionStep | NumberStep | TextStep | ContactStep | InfoStep;

// ---- Solar quote quiz ----

export const FIRST_STEP_ID = 'home_type';

export const STEPS: Record<string, Step> = {
  home_type: {
    id: 'home_type',
    kind: 'single',
    title: "What's your home type?",
    subtitle: 'This shapes everything from roof access to permitting.',
    illustration: '🏡',
    options: [
      { value: 'single_family', label: 'Single-family home', emoji: '🏠' },
      { value: 'townhouse', label: 'Townhouse', emoji: '🏘️' },
      { value: 'condo', label: 'Condo / Apartment', emoji: '🏢', hint: 'Typically requires HOA approval' },
      { value: 'mobile', label: 'Mobile home', emoji: '🚐' },
    ],
    next: (a) => (a.home_type === 'condo' || a.home_type === 'mobile' ? 'unsupported' : 'ownership'),
  } as OptionStep,

  unsupported: {
    id: 'unsupported',
    kind: 'info',
    title: "We're not the best fit for this property — yet.",
    subtitle: 'Solar on condos and mobile homes has tricky permitting we don\'t support today. Drop your email and we\'ll reach out when we can help.',
    illustration: '🌧️',
    body: 'In the meantime, we can refer you to a partner who specializes in your home type.',
    next: () => 'contact',
  } as InfoStep,

  ownership: {
    id: 'ownership',
    kind: 'single',
    title: 'Do you own the home?',
    illustration: '🔑',
    options: [
      { value: 'own', label: 'Yes, I own it', emoji: '✅' },
      { value: 'rent', label: 'I rent', emoji: '🚪' },
      { value: 'buying', label: 'In the process of buying', emoji: '🤝' },
    ],
    next: (a) => (a.ownership === 'rent' ? 'rent_dead' : 'monthly_bill'),
  } as OptionStep,

  rent_dead: {
    id: 'rent_dead',
    kind: 'info',
    title: 'Solar usually needs an owner on the title.',
    subtitle: 'We can keep your info on file and notify your landlord if they ever ask about solar — totally optional.',
    illustration: '📬',
    body: 'No pressure. Leave your email below and we\'ll only reach out with one tasteful note.',
    next: () => 'contact',
  } as InfoStep,

  monthly_bill: {
    id: 'monthly_bill',
    kind: 'number',
    title: "What's your average monthly electric bill?",
    subtitle: 'Roughly. We\'ll size your system around this.',
    illustration: '⚡',
    min: 30,
    max: 1500,
    step: 10,
    unit: '$',
    placeholder: '180',
    next: (a) => (Number(a.monthly_bill) < 75 ? 'low_bill' : 'roof_age'),
  } as NumberStep,

  low_bill: {
    id: 'low_bill',
    kind: 'info',
    title: 'Heads up: small bills, smaller savings.',
    subtitle: 'Solar still works, but the payback period stretches when bills are under ~$75/mo.',
    illustration: '🔍',
    body: 'You can keep going — we\'ll just be transparent about the numbers.',
    next: () => 'roof_age',
  } as InfoStep,

  roof_age: {
    id: 'roof_age',
    kind: 'single',
    title: 'How old is your roof?',
    subtitle: 'Older roofs may need replacement before install.',
    illustration: '🏚️',
    options: [
      { value: 'new', label: 'Less than 5 years', emoji: '🆕' },
      { value: 'mid', label: '5–15 years', emoji: '🪜' },
      { value: 'old', label: '15+ years', emoji: '🧱' },
      { value: 'unknown', label: 'Not sure', emoji: '🤷' },
    ],
    next: () => 'roof_shading',
  } as OptionStep,

  roof_shading: {
    id: 'roof_shading',
    kind: 'single',
    title: 'How much sun does your roof get?',
    illustration: '☀️',
    options: [
      { value: 'full', label: 'Full sun all day', emoji: '🌞' },
      { value: 'partial', label: 'Some shade from trees / neighbors', emoji: '🌳' },
      { value: 'mostly_shaded', label: 'Mostly shaded', emoji: '🌲', hint: 'Solar may underperform' },
    ],
    next: () => 'usage_pattern',
  } as OptionStep,

  usage_pattern: {
    id: 'usage_pattern',
    kind: 'multi',
    title: 'Which of these will you have in the next 3 years?',
    subtitle: 'Pick all that apply — these change your future load.',
    illustration: '🔌',
    options: [
      { value: 'ev', label: 'Electric vehicle', emoji: '🚗' },
      { value: 'heat_pump', label: 'Heat pump (HVAC)', emoji: '🌡️' },
      { value: 'pool', label: 'Pool / hot tub', emoji: '🏊' },
      { value: 'addition', label: 'Home addition', emoji: '🧰' },
      { value: 'none', label: 'None of the above', emoji: '🚫' },
    ],
    next: () => 'battery',
  } as OptionStep,

  battery: {
    id: 'battery',
    kind: 'single',
    title: 'Want battery backup?',
    subtitle: 'Battery keeps the lights on during outages and stores excess solar.',
    illustration: '🔋',
    options: [
      { value: 'yes', label: 'Yes, definitely', emoji: '✅' },
      { value: 'maybe', label: 'Maybe — show me the cost', emoji: '🤔' },
      { value: 'no', label: 'No thanks', emoji: '🙅' },
    ],
    next: () => 'timeline',
  } as OptionStep,

  timeline: {
    id: 'timeline',
    kind: 'single',
    title: 'When are you hoping to install?',
    illustration: '📆',
    options: [
      { value: 'asap', label: 'ASAP — within 30 days', emoji: '🔥' },
      { value: 'three_months', label: 'In the next 3 months', emoji: '⏳' },
      { value: 'this_year', label: 'Sometime this year', emoji: '🗓️' },
      { value: 'researching', label: 'Just researching', emoji: '📚' },
    ],
    next: () => 'zip',
  } as OptionStep,

  zip: {
    id: 'zip',
    kind: 'text',
    title: 'What ZIP code is the home in?',
    subtitle: 'We use this for local incentives and pricing.',
    illustration: '📍',
    placeholder: '94110',
    pattern: /^\d{5}$/,
    helperText: '5-digit US ZIP',
    next: () => 'contact',
  } as TextStep,

  contact: {
    id: 'contact',
    kind: 'contact',
    title: 'Where should we send your estimate?',
    subtitle: 'No spam. One follow-up email and a single SMS — that\'s it.',
    illustration: '📮',
    next: () => null,
  } as ContactStep,
};

export function nextStepId(currentId: string, answers: QuizAnswers): string | null {
  let cursor: string | null = STEPS[currentId].next(answers);
  while (cursor && STEPS[cursor]?.skipIf?.(answers)) {
    cursor = STEPS[cursor].next(answers);
  }
  return cursor;
}

/** Linear preview — returns full chain following current answers. */
export function chainFrom(startId: string, answers: QuizAnswers): string[] {
  const out: string[] = [];
  let cursor: string | null = startId;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor)) {
    out.push(cursor);
    seen.add(cursor);
    cursor = nextStepId(cursor, answers);
  }
  return out;
}
