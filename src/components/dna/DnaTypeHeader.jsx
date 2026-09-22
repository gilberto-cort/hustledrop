import React from 'react';
import { DNA_TYPES, identityStatement } from '@/lib/dnaDisplay';

// Retro-RPG identity header: PRIMARY / SECONDARY / HUSTLE CODE.
export default function DnaTypeHeader({ dna }) {
  const primary = DNA_TYPES[dna.primary_type];
  const secondary = DNA_TYPES[dna.secondary_type];
  return (
    <div className="rounded-2xl border-2 border-white/15 bg-white/[0.02] p-6 sm:p-8">
      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">YOUR HUSTLEDNA</div>
      <div className="mt-5 space-y-3 font-mono uppercase">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-[10px] tracking-[0.25em] text-muted-foreground">PRIMARY</span>
          <span className={`text-2xl font-bold tracking-wide ${primary.accent}`}>{primary.label}</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-[10px] tracking-[0.25em] text-muted-foreground">SECONDARY</span>
          <span className={`text-base font-semibold ${secondary.accent}`}>{secondary.label}</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-[10px] tracking-[0.25em] text-muted-foreground">HUSTLE CODE</span>
          <span className="rounded border border-white/20 bg-white/5 px-3 py-1 text-sm font-bold tracking-[0.2em]">{dna.hustle_code}</span>
        </div>
      </div>
      <p className="mt-5 text-sm leading-relaxed text-foreground/90">{identityStatement(dna)}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        HustleDNA describes how your stated preferences suggest you may like to build and operate a business. It is not a psychological test, an assessment or a prediction of success.
      </p>
    </div>
  );
}