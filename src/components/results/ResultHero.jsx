import React from 'react';
import { Link } from 'react-router-dom';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// Result reveal: #1 match, Personal Fit, match confidence and the user's
// HustleDNA identity. Personal Fit is compatibility with stated
// circumstances — never a success or income prediction.
export default function ResultHero({ match, confidence, dna, avatar, hasChosenAvatar }) {
  const m = match.model;
  const primary = dna ? DNA_TYPES[dna.primary_type] : null;
  const secondary = dna?.secondary_type ? DNA_TYPES[dna.secondary_type] : null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">YOUR #1 HUSTLEMATCH</div>
      <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{m.name}</h1>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-5xl font-bold leading-none text-gradient sm:text-6xl">{match.fit}%</span>
        <span className="pb-1 text-xs font-semibold tracking-[0.15em] text-muted-foreground">PERSONAL FIT</span>
      </div>
      <div className="mt-3 text-xs font-medium text-muted-foreground">
        MATCH CONFIDENCE:{' '}
        <span className="font-semibold text-foreground">{confidence?.category || 'GOOD'}</span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Personal Fit measures compatibility with your stated circumstances — not a prediction of success or income.
      </p>

      {dna && primary && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">YOUR HUSTLEDNA</div>
          <div className="mt-3 flex items-center gap-4">
            <SpriteDisplay avatar={avatar} size="sm" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2">
                <span className={`font-mono text-sm font-bold ${primary.accent}`}>{primary.label}</span>
                {secondary && (
                  <>
                    <span className="text-xs text-muted-foreground">+</span>
                    <span className={`font-mono text-sm ${secondary.accent}`}>{secondary.label}</span>
                  </>
                )}
              </div>
              <div className="mt-1 inline-block rounded border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[11px] font-bold tracking-widest">
                {dna.hustle_code}
              </div>
            </div>
            <div className="ml-auto flex flex-col items-end gap-1.5">
              {!hasChosenAvatar && (
                <Link
                  to="/hustledna"
                  className="rounded-full bg-brand-gradient px-3 py-1.5 text-[10px] font-bold tracking-wider text-white"
                >
                  CHOOSE MY CHARACTER
                </Link>
              )}
              <Link to="/hustledna" className="text-[11px] font-medium text-primary transition hover:underline">
                VIEW MY FULL HUSTLEDNA
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}