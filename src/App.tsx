import React, { useMemo, useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { GoalCard } from './components/GoalCard';
import { Sparkle, UploadCloud } from './components/Icons';
import Simulator from './components/pages/Simulator';
import type { AnalyzeResponse, AppState, CreditData, Goal, Pass2Normalization, Pass3Advice } from './types';
import { normalizeFromCreditData } from './utils/normalizer';
import { generateAdviceFromPass2 } from './utils/advice';

const SECTION = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

export default function App() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>(() => (supportsFileInput() ? 'upload' : 'paste'));
  const [profile, setProfile] = useState<Pass2Normalization | null>(null);
  const [advice, setAdvice] = useState<Pass3Advice | null>(null);

  const initialScore = useMemo(() => (profile ? profile.baselineScoreEstimate : 620), [profile]);

  async function analyze(content: string, mimeType: string) {
    setError(null);
    setAppState('loading');
    try {
      const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || '';
      const res = await fetch(`${apiBase}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mimeType }),
      });

      if (!res.ok) {
        const e = await res.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(e.error || 'Analysis failed');
      }

      const data = (await res.json()) as AnalyzeResponse;
      setCreditData(data.credit_data);
      setGoals(data.personalized_goals);
      // Compute normalization/advice for three-pass pipeline context
      const p2 = normalizeFromCreditData(data.credit_data);
      setProfile(p2);
      setAdvice(generateAdviceFromPass2(p2));
      setAppState('results');
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
      setAppState('error');
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className={`${SECTION} py-5 flex items-center gap-3`}>
          <Sparkle className="h-7 w-7" />
          <h1 className="text-xl font-semibold tracking-tight">
            AI FICO — Credit Report Analyzer
          </h1>
        </div>
      </header>

      <main className={`${SECTION} py-8 space-y-10`}>
        {/* Input */}
        <section className="space-y-6">
          <h2 className="text-lg font-medium">Dual Input Methods</h2>
          <div className="border-b">
            <nav className="flex gap-2" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
                  activeTab === 'upload'
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
                  activeTab === 'paste'
                    ? 'border-neutral-900 text-neutral-900'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Paste
              </button>
            </nav>
          </div>
          <div>
            {activeTab === 'upload' ? (
              <FileUpload onSubmit={analyze} />
            ) : (
              <PasteBox onSubmit={analyze} />
            )}
          </div>
          <p className="text-sm text-neutral-600 flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            Upload .pdf, .txt, .csv, or .json or paste the raw text.
          </p>
        </section>

        {/* Results */}
        {appState === 'loading' && (
          <div className="rounded-2xl p-6 bg-white shadow-sm border animate-pulse">
            <div className="h-4 w-40 bg-neutral-200 rounded mb-4" />
            <div className="h-3 w-full bg-neutral-100 rounded" />
          </div>
        )}

        {appState === 'error' && (
          <div className="rounded-2xl p-4 border bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {appState === 'results' && creditData && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium">Personalized Goals</h2>
              <div className="text-sm text-neutral-600">
                Estimated starting FICO: <span className="font-semibold">{initialScore}</span>
              </div>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {goals.map((g) => (
                <GoalCard key={g.goal_id} goal={g} onSimulate={() => setSelectedGoal(g)} />
              ))}
            </div>
          </section>
        )}

        {appState === 'results' && profile && (
          <section className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="font-semibold mb-3">Report Profile (Pass 2)</h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Baseline score:</span> {profile.baselineScoreEstimate}
                </div>
                <div>
                  <span className="font-medium">Payment History:</span> {profile.paymentHistory.status} · lates {profile.paymentHistory.latePaymentsTotal ?? 0}
                </div>
                <div>
                  <span className="font-medium">Amounts Owed:</span> {profile.amountsOwed.status} · util {profile.amountsOwed.overallUtilization}%
                </div>
                <div>
                  <span className="font-medium">Length of History:</span> {profile.lengthOfHistory.status} · oldest {profile.lengthOfHistory.oldestAccountAgeYears}y · avg {profile.lengthOfHistory.averageAccountAgeYears}y
                </div>
                <div>
                  <span className="font-medium">New Credit:</span> {profile.newCredit.status} · inquiries {profile.newCredit.recentInquiries12mo}
                </div>
                <div>
                  <span className="font-medium">Credit Mix:</span> {profile.creditMix.status} · types {(Array.isArray(profile.creditMix.accountTypes) ? profile.creditMix.accountTypes.join(', ') : '')}
                </div>
              </div>
            </div>

            {advice && (
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <h3 className="font-semibold mb-3">Advice (Pass 3)</h3>
                <div className="text-sm space-y-2">
                  <div className="text-neutral-700">{advice.currentState.summary}</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div><span className="font-medium">PH:</span> {advice.ficoImpactBreakdown.paymentHistory}</div>
                    <div><span className="font-medium">AO:</span> {advice.ficoImpactBreakdown.amountsOwed}</div>
                    <div><span className="font-medium">LoH:</span> {advice.ficoImpactBreakdown.lengthOfHistory}</div>
                    <div><span className="font-medium">NC:</span> {advice.ficoImpactBreakdown.newCredit}</div>
                    <div><span className="font-medium">Mix:</span> {advice.ficoImpactBreakdown.creditMix}</div>
                  </div>
                  <div className="pt-2">
                    <div className="font-medium mb-1">Action Plan</div>
                    <ol className="list-decimal pl-5 space-y-1">
                      {advice.personalizedActionPlan.map((a, i) => (
                        <li key={i}>
                          {a.action} · {a.estimatedPointGain} · {a.timeframe}
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="pt-2 text-sm">
                    <span className="font-medium">Projected:</span> expected {advice.projectedOutcomes.expectedScore}, best {advice.projectedOutcomes.bestCaseScore} in {advice.projectedOutcomes.timeframe}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <Simulator
        open={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        initialScore={initialScore}
        creditData={creditData}
        goal={selectedGoal}
      />

      <footer className="mt-16 py-8 text-center text-xs text-neutral-500">
        Built for production • Tailwind + React • Cursor-safe structure
      </footer>
    </div>
  );
}

// --- Helpers ---
function supportsFileInput(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return 'FileReader' in window && 'Blob' in window && 'File' in window;
  } catch {
    return false;
  }
}
// removed obsolete estimateFico/utilizationPct in favor of Pass2 baseline

// --- Paste box ---
function PasteBox({ onSubmit }: { onSubmit: (content: string, mimeType: string) => void }) {
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col">
      <label className="text-sm font-medium mb-2">Paste your credit report text</label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Paste raw text here..."
        className="min-h-[220px] resize-y rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />
      <div className="mt-3 flex justify-end">
        <button
          onClick={async () => {
            if (!value.trim()) return;
            setBusy(true);
            await onSubmit(value, 'text/plain');
            setBusy(false);
          }}
          disabled={busy || !value.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-4 py-2 disabled:opacity-50"
        >
          <Sparkle className="h-4 w-4" /> Analyze
        </button>
      </div>
    </div>
  );
}


