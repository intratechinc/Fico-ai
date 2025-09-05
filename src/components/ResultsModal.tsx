import React from 'react';
import type { Goal, Pass2Normalization, Pass3Advice } from '../types';
import { GoalCard } from './GoalCard';

interface Props {
  open: boolean;
  onClose: () => void;
  profile: Pass2Normalization | null;
  advice: Pass3Advice | null;
  goals: Goal[];
  onSelectGoal: (goal: Goal) => void;
  score: number;
}

export default function ResultsModal({ open, onClose, profile, advice, goals, onSelectGoal, score }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-5xl bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold leading-tight">Report Snapshot</h3>
          <button className="text-sm text-neutral-600 hover:text-black" onClick={onClose}>Close</button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto min-h-0">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="font-semibold mb-3">Profile</h4>
              {profile ? (
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">Score:</span> {score}
                  </div>
                  <div>
                    <span className="font-medium">Payment history:</span> {profile.paymentHistory.status} · lates {profile.paymentHistory.latePaymentsTotal ?? 0}
                  </div>
                  <div>
                    <span className="font-medium">Utilization:</span> {profile.amountsOwed.status} · {profile.amountsOwed.overallUtilization}%
                  </div>
                  <div>
                    <span className="font-medium">Account age:</span> {profile.lengthOfHistory.status} · oldest {profile.lengthOfHistory.oldestAccountAgeYears}y · avg {profile.lengthOfHistory.averageAccountAgeYears}y
                  </div>
                  <div>
                    <span className="font-medium">Inquiries:</span> {profile.newCredit.recentInquiries12mo}
                  </div>
                  <div>
                    <span className="font-medium">Credit types:</span> {(Array.isArray(profile.creditMix.accountTypes) ? profile.creditMix.accountTypes.join(', ') : '')}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-neutral-500">No profile available</div>
              )}
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h4 className="font-semibold mb-3">Advice</h4>
              {advice ? (
                <div className="text-sm space-y-2">
                  <div className="text-neutral-700">{advice.currentState.summary}</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div><span className="font-medium">PH:</span> {advice.ficoImpactBreakdown.paymentHistory}</div>
                    <div><span className="font-medium">AO:</span> {advice.ficoImpactBreakdown.amountsOwed}</div>
                    <div><span className="font-medium">LoH:</span> {advice.ficoImpactBreakdown.lengthOfHistory}</div>
                    <div><span className="font-medium">NC:</span> {advice.ficoImpactBreakdown.newCredit}</div>
                    <div><span className="font-medium">Mix:</span> {advice.ficoImpactBreakdown.creditMix}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-neutral-500">No advice available</div>
              )}
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Personalized Goals</h4>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {goals.map((g) => (
                <GoalCard key={g.goal_id} goal={g} onSimulate={() => onSelectGoal(g)} />
              ))}
            </div>
          </section>
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button className="text-sm text-neutral-600 hover:text-black" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}


