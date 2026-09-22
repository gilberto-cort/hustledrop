import React from 'react';
import { negativeText, LOCATION_CHECK_NOTE } from '@/lib/matchDisplay';

// WHAT TO KNOW BEFORE YOU START — the most meaningful negative factors and
// friction reasons. Legitimate friction is never hidden.
export default function TradeoffSection({ match }) {
  const negatives = (match.negatives || []).slice(0, 3);
  const warning = match.model.verification_warning;
  if (negatives.length === 0 && !warning) return null;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">
        WHAT TO KNOW BEFORE YOU START
      </div>
      <ul className="mt-4 space-y-2.5">
        {negatives.map((n, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
            {negativeText(n)}
          </li>
        ))}
        {warning && (
          <li className="flex gap-2.5 text-sm text-muted-foreground">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
            {warning}
          </li>
        )}
      </ul>
      <p className="mt-4 border-t border-white/10 pt-3 text-xs leading-relaxed text-muted-foreground">
        {LOCATION_CHECK_NOTE}
      </p>
    </section>
  );
}