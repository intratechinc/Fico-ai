import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function InfoModal({ open, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-lg font-semibold leading-tight">What’s in my FICO Scores?</h3>
          <button className="text-sm text-neutral-600 hover:text-black" onClick={onClose}>Close</button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <p>
            FICO Scores are calculated from five categories of data in your credit report. The typical importance for each category is:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><span className="font-medium">Payment history (35%)</span>: Whether you’ve paid past credit accounts on time.</li>
            <li><span className="font-medium">Amounts owed (30%)</span>: How much of your available credit you are using (utilization) and balances across accounts.</li>
            <li><span className="font-medium">Length of credit history (15%)</span>: Age of your oldest account, newest account, and the average age.</li>
            <li><span className="font-medium">New credit (10%)</span>: Recent hard inquiries and newly opened accounts.</li>
            <li><span className="font-medium">Credit mix (10%)</span>: Your mix of credit types like credit cards, installment loans, and mortgages.</li>
          </ul>
          <p>
            The importance of these categories can vary depending on your overall profile, and scores can change as your report updates. Your FICO Score only considers the information in your credit report; other factors like income may be used by lenders separately.
          </p>
          <p className="text-xs text-neutral-500">Source: myFICO education materials.</p>
        </div>
      </div>
    </div>
  );
}


