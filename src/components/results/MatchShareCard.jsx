import React from 'react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';

// Shareable HustleMatch card — visually related to the DNA share card.
// No projected earnings, no guaranteed outcomes, by design.
export default function MatchShareCard({ match, dna, avatar }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border-2 border-white/15 bg-card p-5 text-center glow-soft">
      <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">MY HUSTLEMATCH</div>
      <div className="mt-4 text-5xl font-bold leading-none text-gradient">{match.fit}%</div>
      <div className="mt-1 font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
        PERSONAL FIT
      </div>
      <h2 className="mt-4 text-lg font-semibold text-foreground">{match.model.name}</h2>
      {dna && (
        <div className="mt-3 inline-block rounded border border-white/20 bg-white/5 px-3 py-1 font-mono text-xs font-bold tracking-[0.2em]">
          HUSTLEDNA: {dna.hustle_code}
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <SpriteDisplay avatar={avatar} size="md" />
      </div>
      <p className="mt-3 font-mono text-[11px] text-muted-foreground">Here's what matched me.</p>
      <div className="mt-4 border-t border-white/10 pt-3">
        <div className="font-mono text-[10px] font-semibold tracking-[0.3em] text-foreground">HUSTLEDROP</div>
        <div className="mt-2 rounded-lg bg-brand-gradient-soft py-2 font-mono text-xs font-bold tracking-wider text-foreground">
          WHAT'S YOUR HUSTLEMATCH?
        </div>
      </div>
    </div>
  );
}