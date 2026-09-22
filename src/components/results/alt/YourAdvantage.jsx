import React from 'react';
import { dnaConnection } from '@/lib/matchDisplay';

// YOUR ADVANTAGE — one work-style observation combining the user's primary
// and secondary HustleDNA. Template-based from the DNA record; never a
// psychological claim and never a success prediction.
export default function YourAdvantage({ dna }) {
  if (!dna) return null;
  const c = dnaConnection(dna);
  return (
    <section className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-5">
      <div className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">YOUR ADVANTAGE</div>
      <div className="mt-2 font-mono text-sm font-bold tracking-wider text-primary">{c.header}</div>
      <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{c.primary}</p>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        A work-style observation from your HustleDNA — not a prediction of results.
      </p>
    </section>
  );
}