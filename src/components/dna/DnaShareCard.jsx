import React from 'react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import { DNA_TYPES, STRENGTHS } from '@/lib/dnaDisplay';

// Shareable HustleDNA card. No income promises, no success probability,
// no IQ-style language, no psychological diagnosis — by design.
export default function DnaShareCard({ dna, avatar }) {
  const primary = DNA_TYPES[dna.primary_type];
  const secondary = DNA_TYPES[dna.secondary_type];
  const strengths = (dna.strengths || []).slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border-2 border-white/15 bg-card p-5 text-center glow-soft">
      <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">MY HUSTLEDNA</div>
      <div className="mt-4 flex justify-center">
        <SpriteDisplay avatar={avatar} size="lg" />
      </div>
      <div className={`mt-4 font-mono text-xl font-bold tracking-wide ${primary.accent}`}>{primary.label}</div>
      {secondary && <div className={`mt-1 font-mono text-xs ${secondary.accent}`}>+ {secondary.label}</div>}
      <div className="mt-3 inline-block rounded border border-white/20 bg-white/5 px-3 py-1 font-mono text-sm font-bold tracking-[0.2em]">{dna.hustle_code}</div>
      <div className="mt-4 space-y-1 font-mono text-[11px] text-foreground/85">
        {strengths.map((token) => (
          <div key={token}>◆ {STRENGTHS[token] || token}</div>
        ))}
      </div>
      <div className="mt-5 border-t border-white/10 pt-3">
        <div className="font-mono text-[10px] font-semibold tracking-[0.3em] text-foreground">HUSTLEDROP</div>
        <div className="mt-2 rounded-lg bg-brand-gradient-soft py-2 font-mono text-xs font-bold tracking-wider text-foreground">
          WHAT'S YOUR HUSTLEDNA?
        </div>
      </div>
    </div>
  );
}