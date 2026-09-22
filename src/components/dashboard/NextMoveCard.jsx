import React from 'react';
import { Link } from 'react-router-dom';

// The dashboard's action core: YOUR BUSINESS, Personal Fit, current stage
// and exactly ONE deterministic Next Move with a DO IT button.
export default function NextMoveCard({ businessName, modelFamily, fit, dna, stage, move }) {
  return (
    <div className="rounded-2xl border-gradient p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">YOUR BUSINESS</div>
          <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-foreground">
            {businessName}
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {modelFamily && (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {modelFamily}
              </span>
            )}
            {typeof fit === 'number' && (
              <span className="font-mono text-[10px] font-bold tracking-wider text-primary">
                PERSONAL FIT {fit}/99
              </span>
            )}
            {dna && (
              <span className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground">
                {dna}
              </span>
            )}
          </div>
        </div>
        <span className="rounded-full border border-primary/40 bg-brand-gradient-soft px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest text-primary">
          {stage}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground">NEXT MOVE</div>
        <div className="mt-1.5 text-base font-semibold text-foreground">{move.label}</div>
        {move.description && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{move.description}</p>
        )}
        <Link
          to={move.path}
          className="mt-3 inline-flex items-center justify-center rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.02]"
        >
          {move.cta}
        </Link>
      </div>
    </div>
  );
}