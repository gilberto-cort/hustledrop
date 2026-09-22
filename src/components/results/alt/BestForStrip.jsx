import React from 'react';
import { bestFor } from '@/lib/businessCategory';

// BEST FOR — 2–3 short traits this model genuinely rewards, derived from real
// BusinessModel attributes only. No unsupported claims.
export default function BestForStrip({ match }) {
  const traits = bestFor(match.model);
  if (traits.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 px-1">
      <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">BEST FOR</span>
      {traits.map((t) => (
        <span
          key={t.label}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-foreground/85"
        >
          <t.Icon className="h-3 w-3 text-primary" />
          {t.label}
        </span>
      ))}
    </div>
  );
}