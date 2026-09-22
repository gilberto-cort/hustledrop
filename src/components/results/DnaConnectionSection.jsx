import React from 'react';
import { dnaConnection } from '@/lib/matchDisplay';

// WHY IT FITS YOUR HUSTLEDNA — a qualitative, template-based connection between
// the user's DNA types and the business. Personal Fit is never modified.
export default function DnaConnectionSection({ dna }) {
  if (!dna) return null;
  const conn = dnaConnection(dna);
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">
        WHY IT FITS YOUR HUSTLEDNA
      </div>
      <div className="mt-3 font-mono text-sm font-bold tracking-wider text-foreground">{conn.header}</div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{conn.primary}</p>
      {conn.secondary && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{conn.secondary}</p>
      )}
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        A work-style description, not a psychological assessment.
      </p>
    </section>
  );
}