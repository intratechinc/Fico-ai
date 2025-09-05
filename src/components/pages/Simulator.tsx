import React, { useMemo, useState } from 'react';
import type { CreditData, Goal } from '../../types';
import { ChevronRight } from '../Icons';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  open: boolean;
  onClose: () => void;
  initialScore: number;
  creditData: CreditData | null;
  goal: Goal | null;
}

export default function Simulator({ open, onClose, initialScore, creditData, goal }: Props) {
  const [util, setUtil] = useState<number>(creditData ? utilizationPct(creditData) : 30);
  const [inquiries, setInquiries] = useState<number>(creditData?.inquiries ?? 0);
  const [lates, setLates] = useState<number>(creditData?.late_payments ?? 0);
  const [snapshots, setSnapshots] = useState<{ label: string; score: number }[]>([]);

  const goalImpact = useMemo(() => (goal ? goal.action_plan.reduce((s, a) => s + (a.impact || 0), 0) : 0), [goal]);

  const projected = useMemo(() => applyWhatIf(initialScore + goalImpact, util, inquiries, lates), [initialScore, goalImpact, util, inquiries, lates]);

  const chartData = useMemo(() => [
    { step: 'Now', score: initialScore },
    { step: 'Goal', score: initialScore + goalImpact },
    { step: 'What‑If', score: projected },
  ], [initialScore, goalImpact, projected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <div className="text-sm text-neutral-500">Simulation</div>
            <h3 className="text-lg font-semibold leading-tight">{goal?.title ?? 'What‑If Planner'}</h3>
          </div>
          <button className="text-sm text-neutral-600 hover:text-black" onClick={onClose}>Close</button>
        </div>

        <div className="p-5 grid gap-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-xl border p-4">
              <div className="text-sm text-neutral-600 mb-3">Projected FICO</div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                    <XAxis dataKey="step" />
                    <YAxis domain={[300, 850]} />
                    <Tooltip cursor={false} />
                    <Line type="monotone" dataKey="score" dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-4">
              <Control label={`Credit Utilization (${util}%)`}>
                <input type="range" min={0} max={100} value={util} onChange={(e) => setUtil(Number(e.target.value))} className="w-full" />
              </Control>
              <Control label={`Hard Inquiries (${inquiries})`}>
                <input type="range" min={0} max={15} value={inquiries} onChange={(e) => setInquiries(Number(e.target.value))} className="w-full" />
              </Control>
              <Control label={`Late Payments (${lates})`}>
                <input type="range" min={0} max={50} value={lates} onChange={(e) => setLates(Number(e.target.value))} className="w-full" />
              </Control>

              <div className="pt-2 flex items-center justify-between">
                <div className="text-sm text-neutral-600">Projected score</div>
                <div className="text-2xl font-semibold">{projected}</div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  className="rounded-xl bg-black text-white px-3 py-2"
                  onClick={() => setSnapshots((s) => [...s, { label: `v${s.length + 1}`, score: projected }])}
                >
                  Save snapshot
                </button>
                <button
                  className="rounded-xl border px-3 py-2"
                  onClick={() => setSnapshots([])}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <div className="text-sm font-medium mb-3">Snapshots</div>
            {snapshots.length === 0 ? (
              <div className="text-sm text-neutral-500">No snapshots yet. Adjust sliders and save to compare.</div>
            ) : (
              <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {snapshots.map((s, i) => (
                  <li key={i} className="border rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm">{s.label}</span>
                    <span className="font-semibold">{s.score}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {goal?.action_plan?.length ? (
            <div className="rounded-xl border p-4">
              <div className="text-sm font-medium mb-3">Action plan</div>
              <ol className="space-y-2">
                {goal.action_plan.map((a, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2"><Badge>{i + 1}</Badge>{a.step}</span>
                    <span className="font-medium">{a.impact > 0 ? '+' : ''}{a.impact}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2" onClick={onClose}>
            Continue <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-2 text-neutral-700">{label}</div>
      {children}
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-grid place-items-center w-6 h-6 rounded-full bg-neutral-900 text-white text-xs">{children}</span>;
}

function utilizationPct(data: CreditData): number {
  const totals = data.accounts.reduce(
    (acc, a) => {
      acc.limit += a.limit || 0;
      acc.balance += a.balance || 0;
      return acc;
    },
    { balance: 0, limit: 0 }
  );
  if (!totals.limit) return 0;
  return Math.round((totals.balance / totals.limit) * 100);
}

function applyWhatIf(base: number, util: number, inquiries: number, lates: number): number {
  let score = base;
  // Penalize high utilization; reward low
  score += clamp(50 - util * 0.5, -80, 30);
  // Inquiries penalty
  score -= Math.min(60, Math.max(0, inquiries) * 5);
  // Late payments penalty
  score -= Math.min(200, Math.max(0, lates) * 6);
  return clamp(Math.round(score), 300, 850);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}


