import type { Lead } from '../types';

function escape(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    'id', 'createdAt', 'name', 'email', 'phone', 'zip', 'status', 'score', 'scoreValue',
    'systemSizeKw', 'estimateLow', 'estimateHigh', 'paybackYears', 'annualSavings', 'answers',
  ];
  const rows = leads.map((l) => [
    l.id,
    new Date(l.createdAt).toISOString(),
    l.name,
    l.email,
    l.phone,
    l.zip,
    l.status,
    l.score,
    l.scoreValue,
    l.estimate.systemSizeKw,
    l.estimate.low,
    l.estimate.high,
    l.estimate.paybackYears,
    l.estimate.annualSavings,
    JSON.stringify(l.answers),
  ].map(escape).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
