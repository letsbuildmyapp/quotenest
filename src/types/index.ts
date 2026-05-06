export type QuizAnswers = Record<string, string | number | string[] | boolean>;

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export type LeadScore = 'hot' | 'warm' | 'cold';

export interface Estimate {
  low: number;
  high: number;
  systemSizeKw: number;
  panelCount: number;
  annualSavings: number;
  paybackYears: number;
  incentiveDollars: number;
  breakdown: { label: string; amount: number }[];
}

export interface Lead {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  email: string;
  phone: string;
  zip: string;
  answers: QuizAnswers;
  estimate: Estimate;
  score: LeadScore;
  scoreValue: number;
  status: LeadStatus;
  notes?: string;
  source?: string;
}
