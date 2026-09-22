import React from 'react';
import { STRENGTHS, TRAPS, DNA_TYPES } from '@/lib/dnaDisplay';

export default function DnaStrengthsTraps({ dna }) {
  const primary = DNA_TYPES[dna.primary_type];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">NATURAL ADVANTAGES</div>
        <div className="mt-4 space-y-2">
          {(dna.strengths || []).map((token) => (
            <div key={token} className="flex items-center gap-2 font-mono text-xs text-foreground/90">
              <span className={primary.accent}>◆</span>{STRENGTHS[token] || token}
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
          Strengths are only listed where your actual answers support them.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">WATCH OUT FOR</div>
        <div className="mt-4 space-y-2">
          {(dna.traps || []).map((token) => (
            <div key={token} className="font-mono text-xs text-foreground/90">
              <span className="text-orange-400">watch for:</span> {TRAPS[token] || token}
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
          These are execution tendencies to watch — not personality defects.
        </p>
      </div>
    </div>
  );
}