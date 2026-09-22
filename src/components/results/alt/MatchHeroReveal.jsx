import React from 'react';
import { categoryFor } from '@/lib/businessCategory';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// MATCH REVEAL hero — rank, category emblem, identity line, Personal Fit,
// match confidence and the user's DNA classes. Presentation only: every value
// comes from the stored MatchResult and HustleDNA records.
function confidenceWord(score) {
  const s = Number(score) || 0;
  return s >= 85 ? 'HIGH' : s >= 65 ? 'GOOD' : 'LIMITED';
}

export default function MatchHeroReveal({ match, dna }) {
  const m = match.model;
  const cat = categoryFor(m.family);
  const primary = dna ? DNA_TYPES[dna.primary_type] : null;
  const secondary = dna && dna.secondary_type ? DNA_TYPES[dna.secondary_type] : null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-gradient p-5 text-center sm:p-6">
      <div className="font-mono text-[10px] font-bold tracking-[0.35em] text-muted-foreground">
        MATCH #{match.rank} · {cat.code} PATH
      </div>
      <div
        className={`mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-xl border ${cat.chip} glow-primary`}
      >
        <cat.Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-3 text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
        {m.name}
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
        {m.description}
      </p>
      <div className="mt-4 flex items-end justify-center gap-2">
        <span className="font-mono text-5xl font-bold leading-none text-gradient">{match.fit}</span>
        <span className="pb-1 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
          % PERSONAL FIT
        </span>
      </div>
      {typeof match.confidence === 'number' && (
        <span className="mt-2.5 inline-block rounded-full border border-primary/40 bg-brand-gradient-soft px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-primary">
          {confidenceWord(match.confidence)} MATCH CONFIDENCE
        </span>
      )}
      {primary && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">DNA</span>
          <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${primary.chip}`}>
            {primary.label}
          </span>
          {secondary && (
            <span className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${secondary.chip}`}>
              {secondary.label}
            </span>
          )}
        </div>
      )}
      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        Compatibility with your stated circumstances — not a success prediction.
      </p>
    </div>
  );
}