import React from 'react';
import { howYouBuild, idealEnvironment } from '@/lib/dnaDisplay';

export default function DnaBuildStyle({ dna }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">HOW YOU LIKE TO BUILD</div>
        <ul className="mt-4 space-y-2.5">
          {howYouBuild(dna).map((line, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
              <span className="text-primary">▸</span>{line}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">IDEAL BUSINESS ENVIRONMENT</div>
        <ul className="mt-4 space-y-2.5">
          {idealEnvironment(dna).map((line, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
              <span className="text-primary">▸</span>{line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}