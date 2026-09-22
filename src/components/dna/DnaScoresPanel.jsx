import React from 'react';
import { DNA_TYPES, TYPE_ORDER } from '@/lib/dnaDisplay';

// All six archetype scores — never hides the lower ones. Low scores are
// "less naturally aligned with your stated preferences", not weaknesses.
export default function DnaScoresPanel({ scores }) {
  return (
    <div className="space-y-3">
      {TYPE_ORDER.map((type) => {
        const meta = DNA_TYPES[type];
        const score = scores?.[type] ?? 0;
        return (
          <div key={type}>
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
              <span className="text-foreground/80">{meta.code} · {meta.label}</span>
              <span className="text-foreground">{score}</span>
            </div>
            <div className="h-3 w-full border border-white/15 bg-white/[0.03]">
              <div className={`h-full ${meta.bar}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        );
      })}
      <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
        Scores are independent 0–100 scales — you can strongly align with more than one. Lower scores simply mean less naturally aligned with your stated preferences, not weaknesses.
      </p>
    </div>
  );
}