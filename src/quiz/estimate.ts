import type { Estimate, LeadScore, QuizAnswers } from '../types';

const AVG_RATE_PER_KWH = 0.18; // national-ish average residential
const PANEL_WATTS = 400;
const COST_PER_WATT_LOW = 2.6;
const COST_PER_WATT_HIGH = 3.4;
const ITC_PCT = 0.30; // federal investment tax credit (illustrative)
const BATTERY_COST = 13000;

const SHADING_FACTOR: Record<string, number> = {
  full: 1.0,
  partial: 0.85,
  mostly_shaded: 0.6,
};

const FUTURE_LOAD_KW: Record<string, number> = {
  ev: 3.5,
  heat_pump: 2.0,
  pool: 1.5,
  addition: 1.2,
  none: 0,
};

export function calculateEstimate(answers: QuizAnswers): Estimate {
  const monthlyBill = Math.max(30, Number(answers.monthly_bill) || 150);
  const annualKwh = (monthlyBill / AVG_RATE_PER_KWH) * 12;

  const shadingKey = String(answers.roof_shading || 'full');
  const shading = SHADING_FACTOR[shadingKey] ?? 0.9;

  const futureLoads = Array.isArray(answers.usage_pattern) ? (answers.usage_pattern as string[]) : [];
  const futureKw = futureLoads.reduce((sum, k) => sum + (FUTURE_LOAD_KW[k] ?? 0), 0);

  // Sun hours per day (rough US average)
  const sunHours = 4.5;
  const baseKw = annualKwh / (365 * sunHours * shading);
  const systemSizeKw = Math.max(3, +(baseKw + futureKw).toFixed(1));
  const panelCount = Math.ceil((systemSizeKw * 1000) / PANEL_WATTS);

  const watts = systemSizeKw * 1000;
  let low = watts * COST_PER_WATT_LOW;
  let high = watts * COST_PER_WATT_HIGH;

  const wantsBattery = answers.battery === 'yes';
  const maybeBattery = answers.battery === 'maybe';
  const batteryAdd = wantsBattery ? BATTERY_COST : maybeBattery ? BATTERY_COST * 0.5 : 0;
  low += batteryAdd;
  high += batteryAdd;

  // Old roof — add reroof allowance
  if (answers.roof_age === 'old') {
    low += 8000;
    high += 14000;
  }

  const incentiveDollars = Math.round(((low + high) / 2) * ITC_PCT);
  low = Math.round(low - incentiveDollars);
  high = Math.round(high - incentiveDollars);

  const annualSavings = Math.round(monthlyBill * 12 * 0.92 * shading);
  const paybackYears = +(((low + high) / 2) / Math.max(annualSavings, 1)).toFixed(1);

  const breakdown = [
    { label: `Solar panels (${panelCount} × ${PANEL_WATTS}W)`, amount: Math.round(watts * 1.4) },
    { label: 'Inverter & balance of system', amount: Math.round(watts * 0.6) },
    { label: 'Installation labor & permits', amount: Math.round(watts * 0.7) },
    ...(wantsBattery ? [{ label: 'Battery backup', amount: BATTERY_COST }] : []),
    ...(maybeBattery ? [{ label: 'Battery backup (optional)', amount: BATTERY_COST }] : []),
    ...(answers.roof_age === 'old' ? [{ label: 'Re-roof allowance (older roof)', amount: 11000 }] : []),
    { label: 'Federal tax credit (30%)', amount: -incentiveDollars },
  ];

  return {
    low,
    high,
    systemSizeKw,
    panelCount,
    annualSavings,
    paybackYears,
    incentiveDollars,
    breakdown,
  };
}

export function scoreLead(answers: QuizAnswers, estimate: Estimate): { score: LeadScore; value: number } {
  let v = 0;
  if (answers.ownership === 'own') v += 30;
  if (answers.ownership === 'buying') v += 15;
  if (answers.timeline === 'asap') v += 30;
  else if (answers.timeline === 'three_months') v += 22;
  else if (answers.timeline === 'this_year') v += 12;
  else if (answers.timeline === 'researching') v += 4;

  if (Number(answers.monthly_bill) >= 250) v += 20;
  else if (Number(answers.monthly_bill) >= 150) v += 12;
  else if (Number(answers.monthly_bill) >= 75) v += 6;

  if (answers.home_type === 'single_family') v += 10;
  if (answers.roof_shading === 'full') v += 8;
  else if (answers.roof_shading === 'partial') v += 4;

  if (answers.battery === 'yes') v += 6;

  if (estimate.systemSizeKw >= 8) v += 4;

  const score: LeadScore = v >= 70 ? 'hot' : v >= 45 ? 'warm' : 'cold';
  return { score, value: v };
}
