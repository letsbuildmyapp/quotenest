import { useEffect, useMemo, useState } from 'react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { auth } from '../../lib/firebase';
import { subscribeLeads, updateLeadStatus, updateLeadStatusAndOrder, updateLeadNotes } from '../../lib/leads';
import { Logo } from '../../components/Logo';
import type { Lead, LeadScore, LeadStatus } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { downloadCsv, leadsToCsv } from '../../lib/csv';
import { STEPS } from '../../quiz/schema';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'new',        label: 'New',         color: 'bg-grape-200' },
  { id: 'contacted',  label: 'Contacted',   color: 'bg-sun-200' },
  { id: 'qualified',  label: 'Qualified',   color: 'bg-sun-300' },
  { id: 'won',        label: 'Won',         color: 'bg-emerald-200' },
  { id: 'lost',       label: 'Lost',        color: 'bg-red-200' },
];

const SCORE_BG: Record<LeadScore, string> = {
  hot: 'bg-red-100 text-red-800 border-red-300',
  warm: 'bg-sun-100 text-sun-800 border-sun-300',
  cold: 'bg-grape-100 text-grape-800 border-grape-300',
};

type Row = Lead & { _docId: string; order?: number };

// Sort key: explicit `order` if set, else fall back to createdAt (newest at top of list).
function sortKey(r: Row): number {
  return typeof r.order === 'number' ? r.order : (r.createdAt as unknown as number) ?? 0;
}

// Map an answer key+value to a readable {question, answer} pair using the quiz schema.
function readableAnswer(key: string, value: unknown): { question: string; answer: string } {
  const step = (STEPS as Record<string, any>)[key];
  const question = step?.title?.replace(/\?$/, '') ?? key;

  // Multi-select arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return { question, answer: '—' };
    if (step?.kind === 'multi' || step?.options) {
      const labels = value.map((v) => {
        const opt = step.options?.find((o: any) => o.value === v);
        return opt?.label ?? String(v);
      });
      return { question, answer: labels.join(', ') };
    }
    return { question, answer: value.join(', ') };
  }

  // Single-select / option steps
  if ((step?.kind === 'single' || step?.kind === 'multi') && step.options) {
    const opt = step.options.find((o: any) => o.value === value);
    if (opt) return { question, answer: opt.label };
  }

  // Number steps with unit (e.g. monthly bill — "$" prefix)
  if (step?.kind === 'number') {
    const unit = step.unit ?? '';
    return { question, answer: unit === '$' ? `$${value}` : `${value}${unit ? ' ' + unit : ''}` };
  }

  // Plain text/zip
  if (value == null || value === '') return { question, answer: '—' };
  return { question, answer: String(value) };
}

export default function Dashboard() {
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [scoreFilter, setScoreFilter] = useState<LeadScore | 'all'>('all');
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<Row | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetCol, setDropTargetCol] = useState<LeadStatus | null>(null);
  // dropIndicator: { col, before: docId | null } — null `before` means "at the end of the column".
  const [dropIndicator, setDropIndicator] = useState<{ col: LeadStatus; before: string | null } | null>(null);

  useEffect(() => {
    const unsub = subscribeLeads(setRows);
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (scoreFilter !== 'all' && r.score !== scoreFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          r.name.toLowerCase().includes(s) ||
          r.email.toLowerCase().includes(s) ||
          r.zip.includes(s)
        );
      }
      return true;
    });
  }, [rows, scoreFilter, search]);

  const grouped = useMemo(() => {
    const out: Record<LeadStatus, Row[]> = { new: [], contacted: [], qualified: [], won: [], lost: [] };
    for (const r of filtered) out[r.status].push(r);
    // Sort each column DESC so newest / highest-order is at top.
    for (const k of Object.keys(out) as LeadStatus[]) {
      out[k].sort((a, b) => sortKey(b) - sortKey(a));
    }
    return out;
  }, [filtered]);

  const stats = useMemo(() => {
    if (!rows) return null;
    const hot = rows.filter((r) => r.score === 'hot').length;
    const pipe = rows.filter((r) => r.status !== 'won' && r.status !== 'lost').length;
    const totalEstimateMid = rows.reduce((s, r) => s + (r.estimate.low + r.estimate.high) / 2, 0);
    return { count: rows.length, hot, pipe, value: totalEstimateMid };
  }, [rows]);

  function move(r: Row, dir: -1 | 1) {
    const ids = COLUMNS.map((c) => c.id);
    const i = ids.indexOf(r.status);
    const next = ids[Math.max(0, Math.min(ids.length - 1, i + dir))];
    if (next !== r.status) {
      updateLeadStatus(r._docId, next);
      toast.success(`Moved ${r.name.split(' ')[0]} → ${next}`);
    }
  }

  // Compute a fractional order to insert a card at a specific index in a column.
  // Column is sorted DESC by sortKey, so a smaller index = larger key.
  function computeOrderAt(targetCol: LeadStatus, insertIndex: number, draggedDocId: string): number {
    const list = (grouped[targetCol] ?? []).filter((x) => x._docId !== draggedDocId);
    const above = list[insertIndex - 1]; // larger order
    const below = list[insertIndex];     // smaller order
    if (above && below) return (sortKey(above) + sortKey(below)) / 2;
    if (above) return sortKey(above) - 1000;       // dropping at bottom: smaller than above
    if (below) return sortKey(below) + 1000;       // dropping at top: larger than below
    return Date.now();                             // empty column
  }

  function onCardDragStart(e: React.DragEvent, r: Row) {
    setDraggingId(r._docId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', r._docId);
  }

  function onCardDragEnd() {
    setDraggingId(null);
    setDropTargetCol(null);
    setDropIndicator(null);
  }

  function onColDragOver(e: React.DragEvent, col: LeadStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetCol !== col) setDropTargetCol(col);
    // If dragging over the column shell (not a card), the indicator goes to the end.
    if (!dropIndicator || dropIndicator.col !== col) {
      setDropIndicator({ col, before: null });
    }
  }

  function onCardDragOver(e: React.DragEvent, target: Row) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetCol !== target.status) setDropTargetCol(target.status);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const above = e.clientY < rect.top + rect.height / 2;
    if (above) {
      setDropIndicator({ col: target.status, before: target._docId });
    } else {
      // Insert AFTER target → before the next card, or at end if last.
      const list = (grouped[target.status] ?? []).filter((x) => x._docId !== draggingId);
      const idx = list.findIndex((x) => x._docId === target._docId);
      const next = list[idx + 1];
      setDropIndicator({ col: target.status, before: next ? next._docId : null });
    }
  }

  // Drop on the column body (not on a specific card) → append to end.
  function onColDrop(e: React.DragEvent, col: LeadStatus) {
    e.preventDefault();
    const docId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!docId || !rows) return;
    const dragged = rows.find((r) => r._docId === docId);
    if (!dragged) return;
    const list = grouped[col] ?? [];
    const insertIndex = list.filter((x) => x._docId !== docId).length; // bottom
    const newOrder = computeOrderAt(col, insertIndex, docId);
    updateLeadStatusAndOrder(docId, col, newOrder);
    if (dragged.status !== col) toast.success(`Moved ${dragged.name.split(' ')[0]} → ${col}`);
    onCardDragEnd();
  }

  // Drop on a specific card → insert above or below depending on Y position.
  function onCardDrop(e: React.DragEvent, target: Row) {
    e.preventDefault();
    e.stopPropagation();
    const docId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!docId || !rows || docId === target._docId) { onCardDragEnd(); return; }
    const dragged = rows.find((r) => r._docId === docId);
    if (!dragged) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const above = e.clientY < rect.top + rect.height / 2;
    const colList = (grouped[target.status] ?? []).filter((x) => x._docId !== docId);
    const targetIdx = colList.findIndex((x) => x._docId === target._docId);
    const insertIndex = above ? targetIdx : targetIdx + 1;
    const newOrder = computeOrderAt(target.status, insertIndex, docId);
    updateLeadStatusAndOrder(docId, target.status, newOrder);
    if (dragged.status !== target.status) toast.success(`Moved ${dragged.name.split(' ')[0]} → ${target.status}`);
    onCardDragEnd();
  }

  function exportCsv() {
    if (!filtered.length) { toast.error('Nothing to export.'); return; }
    downloadCsv(`quotenest-leads-${new Date().toISOString().slice(0, 10)}.csv`, leadsToCsv(filtered));
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-ink-200/60 bg-cream/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="pill bg-ink-100 text-xs">Admin</span>
          </div>
          <button className="btn-ghost text-sm" onClick={() => signOut(auth).then(() => nav('/admin/login'))}>Sign out</button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="display text-3xl md:text-4xl font-bold">Lead pipeline</h1>
            <p className="text-ink-600 text-sm">
              {stats ? `${stats.count} leads · ${stats.hot} hot · ${stats.pipe} in pipeline · ~${formatCurrency(stats.value)} pipeline value` : 'Loading…'}
            </p>
          </div>
          <button data-tour="export" className="btn-accent text-sm" onClick={exportCsv}>Export CSV</button>
        </div>

        <div data-tour="filters" className="mt-6 flex flex-wrap items-center gap-3">
          <input
            className="input max-w-xs"
            placeholder="Search name, email, ZIP…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {(['all', 'hot', 'warm', 'cold'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScoreFilter(s)}
                className={`pill ${scoreFilter === s ? 'bg-ink-900 text-cream' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban */}
        {rows === null ? (
          <div data-tour="kanban" className="mt-10 grid gap-4 md:grid-cols-5">
            {COLUMNS.map((c) => (
              <div key={c.id} className="card p-4 animate-pulse h-64" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div data-tour="kanban" className="mt-12 card p-10 text-center">
            <div className="text-5xl">🪺</div>
            <p className="display text-2xl mt-3 font-bold">No leads yet</p>
            <p className="mt-1 text-ink-600 text-sm">Take the quiz on the public site, or run <code className="bg-ink-100 px-2 py-0.5 rounded">npm run seed</code> to load demo leads.</p>
          </div>
        ) : (
          <div data-tour="kanban" className="mt-6 grid gap-4 md:grid-cols-5">
            {COLUMNS.map((col) => (
              <div
                key={col.id}
                onDragOver={(e) => onColDragOver(e, col.id)}
                onDragLeave={() => dropTargetCol === col.id && setDropTargetCol(null)}
                onDrop={(e) => onColDrop(e, col.id)}
                className={`card p-3 transition-colors ${dropTargetCol === col.id ? 'ring-4 ring-grape-300' : ''}`}
              >
                <div className={`flex items-center justify-between rounded-2xl px-3 py-2 ${col.color}`}>
                  <span className="font-semibold text-ink-900">{col.label}</span>
                  <span className="pill bg-white">{grouped[col.id].length}</span>
                </div>
                <div className="mt-3 grid gap-3 min-h-[80px]">
                  {grouped[col.id].length === 0 && (
                    <p className="text-xs text-ink-600 px-1 py-4 text-center border-2 border-dashed border-ink-200 rounded-2xl">Drop here</p>
                  )}
                  {grouped[col.id].map((r) => (
                    <div key={r._docId}>
                      {dropIndicator?.col === col.id && dropIndicator.before === r._docId && draggingId !== r._docId ? (
                        <div className="h-1.5 -my-1 bg-grape-500 rounded-full shadow-[0_0_0_3px_rgba(128,71,255,0.25)]" />
                      ) : null}
                    <div
                      draggable
                      onDragStart={(e) => onCardDragStart(e, r)}
                      onDragEnd={onCardDragEnd}
                      onDragOver={(e) => onCardDragOver(e, r)}
                      onDrop={(e) => onCardDrop(e, r)}
                      className={`rounded-2xl border-2 border-ink-900 bg-white p-3 shadow-pop-sm cursor-grab active:cursor-grabbing transition-opacity ${draggingId === r._docId ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <button onClick={() => setActive(r)} className="font-semibold text-ink-900 truncate text-left hover:underline">{r.name}</button>
                          <p className="text-xs text-ink-500 truncate">{r.email}</p>
                        </div>
                        <span className={`pill border ${SCORE_BG[r.score]}`}>{r.score}</span>
                      </div>
                      <p className="mt-2 text-xs text-ink-700">
                        <strong>{formatCurrency(r.estimate.low)}–{formatCurrency(r.estimate.high)}</strong>
                        {' · '}{r.estimate.systemSizeKw}kW
                      </p>
                      <p className="text-xs text-ink-600 mt-1">{formatDate(r.createdAt)}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <button onClick={() => move(r, -1)} className="text-xs text-ink-500 hover:text-ink-900">← Back</button>
                        <button onClick={() => move(r, +1)} className="text-xs text-ink-500 hover:text-ink-900">Forward →</button>
                      </div>
                    </div>
                    </div>
                  ))}
                  {dropIndicator?.col === col.id && dropIndicator.before === null && draggingId ? (
                    <div className="h-1.5 -mt-1 bg-grape-500 rounded-full shadow-[0_0_0_3px_rgba(128,71,255,0.25)]" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {active && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setActive(null)}>
            <div onClick={(e) => e.stopPropagation()} className="card max-w-lg w-full p-6 max-h-[90vh] overflow-auto">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="display text-2xl font-bold">{active.name}</h2>
                  <p className="text-sm text-ink-600">{active.email} · {active.phone}</p>
                  <p className="text-xs text-ink-600 mt-1">{formatDate(active.createdAt)}</p>
                </div>
                <button onClick={() => setActive(null)} className="btn-ghost">Close</button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Stat label="Estimate" value={`${formatCurrency(active.estimate.low)}–${formatCurrency(active.estimate.high)}`} />
                <Stat label="System" value={`${active.estimate.systemSizeKw} kW · ${active.estimate.panelCount} panels`} />
                <Stat label="Score" value={`${active.score} (${active.scoreValue})`} />
                <Stat label="ZIP" value={active.zip} />
              </div>
              <p className="label mt-4">Answers</p>
              <dl className="rounded-2xl bg-ink-50 border-2 border-ink-100 divide-y divide-ink-200 overflow-hidden">
                {Object.entries(active.answers ?? {})
                  .filter(([k]) => k !== 'name' && k !== 'email' && k !== 'phone')
                  .map(([k, v]) => {
                    const { question, answer } = readableAnswer(k, v);
                    return (
                      <div key={k} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 text-sm">
                        <dt className="text-ink-600">{question}</dt>
                        <dd className="font-semibold text-ink-900 text-right">{answer}</dd>
                      </div>
                    );
                  })}
              </dl>
              <p className="label mt-4">How the estimate was calculated</p>
              <CalculationBreakdown lead={active} />

              <p className="label mt-4">Notes</p>
              <textarea
                defaultValue={active.notes ?? ''}
                onBlur={(e) => updateLeadNotes(active._docId, e.target.value).then(() => toast.success('Notes saved'))}
                className="input min-h-[100px]"
                placeholder="Internal notes — saved on blur"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink-50 border-2 border-ink-100 p-3">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="font-semibold text-ink-900">{value}</p>
    </div>
  );
}

// Calculation constants kept in lockstep with src/quiz/estimate.ts.
const CALC_CONSTANTS = {
  ratePerKwh: 0.18,
  panelWatts: 400,
  costPerWattLow: 2.6,
  costPerWattHigh: 3.4,
  itcPct: 0.30,
  sunHoursPerDay: 4.5,
};

const SHADING_FACTORS: Record<string, number> = { full: 1.0, partial: 0.85, mostly_shaded: 0.6 };
const SHADING_LABELS: Record<string, string> = { full: 'Full sun', partial: 'Partial shade', mostly_shaded: 'Mostly shaded' };

function CalculationBreakdown({ lead }: { lead: Row }) {
  const a = lead.answers ?? {};
  const e = lead.estimate;
  const monthlyBill = Math.max(30, Number((a as any).monthly_bill) || 150);
  const annualKwh = Math.round((monthlyBill / CALC_CONSTANTS.ratePerKwh) * 12);
  const shadingKey = String((a as any).roof_shading || 'full');
  const shading = SHADING_FACTORS[shadingKey] ?? 0.9;
  const wantsBattery = (a as any).battery === 'yes';
  const maybeBattery = (a as any).battery === 'maybe';
  const oldRoof = (a as any).roof_age === 'old';
  const futureLoads = Array.isArray((a as any).usage_pattern) ? ((a as any).usage_pattern as string[]) : [];
  const lowCpw = (e.systemSizeKw * 1000 * CALC_CONSTANTS.costPerWattLow);
  const highCpw = (e.systemSizeKw * 1000 * CALC_CONSTANTS.costPerWattHigh);

  return (
    <div className="rounded-2xl bg-ink-50 border-2 border-ink-100 overflow-hidden">
      {/* Inputs we used */}
      <div className="px-4 py-3 border-b-2 border-ink-100">
        <p className="text-xs uppercase tracking-wider text-ink-600 font-semibold mb-2">1. What we used from their answers</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <CalcRow label="Monthly bill" value={`$${monthlyBill}`} />
          <CalcRow label="Roof shading" value={SHADING_LABELS[shadingKey] ?? shadingKey} />
          <CalcRow label="Roof age" value={String((a as any).roof_age || '—')} />
          <CalcRow label="Battery" value={wantsBattery ? 'Yes' : maybeBattery ? 'Maybe' : 'No'} />
          <CalcRow label="Future loads" value={futureLoads.length ? futureLoads.join(', ') : 'None'} />
        </div>
      </div>

      {/* System sizing */}
      <div className="px-4 py-3 border-b-2 border-ink-100">
        <p className="text-xs uppercase tracking-wider text-ink-600 font-semibold mb-2">2. Sizing the system</p>
        <div className="text-sm space-y-1.5">
          <CalcRow label="Annual usage" value={`${annualKwh.toLocaleString()} kWh`} hint={`$${monthlyBill} ÷ $${CALC_CONSTANTS.ratePerKwh}/kWh × 12`} />
          <CalcRow label="Sun hours assumed" value={`${CALC_CONSTANTS.sunHoursPerDay} hrs/day`} hint="US national average" />
          <CalcRow label="Shading factor" value={`× ${shading}`} />
          <CalcRow label="System size" value={`${e.systemSizeKw} kW`} hint={`${annualKwh.toLocaleString()} kWh ÷ (365 × ${CALC_CONSTANTS.sunHoursPerDay} × ${shading})${futureLoads.length && !futureLoads.includes('none') ? ' + future loads' : ''}`} />
          <CalcRow label="Panel count" value={`${e.panelCount} × ${CALC_CONSTANTS.panelWatts}W`} hint={`⌈ ${e.systemSizeKw}kW × 1000 ÷ ${CALC_CONSTANTS.panelWatts}W ⌉`} />
        </div>
      </div>

      {/* Cost math */}
      <div className="px-4 py-3 border-b-2 border-ink-100">
        <p className="text-xs uppercase tracking-wider text-ink-600 font-semibold mb-2">3. Cost math</p>
        <div className="text-sm space-y-1.5">
          <CalcRow label="Cost per watt (low)" value={formatCurrency(lowCpw)} hint={`${e.systemSizeKw * 1000}W × $${CALC_CONSTANTS.costPerWattLow}/W`} />
          <CalcRow label="Cost per watt (high)" value={formatCurrency(highCpw)} hint={`${e.systemSizeKw * 1000}W × $${CALC_CONSTANTS.costPerWattHigh}/W`} />
          {wantsBattery ? <CalcRow label="Battery backup" value="+ $13,000" /> : null}
          {maybeBattery ? <CalcRow label="Battery (optional)" value="+ $6,500" hint="Half-priced since maybe" /> : null}
          {oldRoof ? <CalcRow label="Re-roof allowance" value="+ $8,000–$14,000" hint="Older roof" /> : null}
          <CalcRow label="Federal ITC" value={`− ${formatCurrency(e.incentiveDollars)}`} hint={`${Math.round(CALC_CONSTANTS.itcPct * 100)}% of avg gross cost`} />
        </div>
      </div>

      {/* Final breakdown */}
      <div className="px-4 py-3 border-b-2 border-ink-100">
        <p className="text-xs uppercase tracking-wider text-ink-600 font-semibold mb-2">4. Final breakdown</p>
        <div className="text-sm divide-y divide-ink-200/70">
          {e.breakdown.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-1.5">
              <span className="text-ink-700">{row.label}</span>
              <span className={`font-semibold tabular-nums ${row.amount < 0 ? 'text-grape-700' : 'text-ink-900'}`}>
                {row.amount < 0 ? '−' : ''}{formatCurrency(Math.abs(row.amount))}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t-2 border-ink-300 text-sm font-bold">
          <span>Net installed cost</span>
          <span className="tabular-nums">{formatCurrency(e.low)} – {formatCurrency(e.high)}</span>
        </div>
      </div>

      {/* Savings */}
      <div className="px-4 py-3">
        <p className="text-xs uppercase tracking-wider text-ink-600 font-semibold mb-2">5. Annual savings &amp; payback</p>
        <div className="text-sm space-y-1.5">
          <CalcRow label="Annual savings" value={formatCurrency(e.annualSavings)} hint={`$${monthlyBill} × 12 × 0.92 × ${shading}`} />
          <CalcRow label="Payback period" value={`${e.paybackYears} yrs`} hint="Avg cost ÷ annual savings" />
        </div>
      </div>
    </div>
  );
}

function CalcRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4">
      <div className="min-w-0">
        <span className="text-ink-700">{label}</span>
        {hint ? <span className="text-xs text-ink-500 ml-2">({hint})</span> : null}
      </div>
      <span className="font-semibold text-ink-900 tabular-nums">{value}</span>
    </div>
  );
}
