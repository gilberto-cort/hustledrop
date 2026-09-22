import React from 'react';
import { positiveText } from '@/lib/matchDisplay';

// WHY THIS FITS YOU — the strongest deterministic positive MatchResult factors,
// translated into plain language. 3–5 shown, never fabricated.
export default function WhyThisFitsSection({ match }) {
  const positives = (match.positives || []).slice(0, 5);
  if (positives.length === 0) return null;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">WHY THIS FITS YOU</div>
      <ul className="mt-4 space-y-2.5">
        {positives.map((p, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-foreground/90">
            <span className="mt-0.5 font-mono text-primary">✓</span>
            {positiveText(p)}
          </li>
        ))}
      </ul>
    </section>
  );
}