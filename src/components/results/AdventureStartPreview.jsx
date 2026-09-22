import React from 'react';
import { Link } from 'react-router-dom';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import AdventureStages from '@/components/game/AdventureStages';
import PreviewVisuals from '@/components/game/PreviewVisuals';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// YOUR ADVENTURE STARTS HERE — free preview on the Match results page, shown
// right after a business is selected and BEFORE the paid CTA (which lives on
// the Builder). Deterministic content only: the user's real DNA, their
// selected match's real first validation action, and preview-only
// progression visuals. The free match details and alternate matches above
// and below stay exactly as they are.
export default function AdventureStartPreview({ model, fit, dna, avatar }) {
  const primary = dna ? DNA_TYPES[dna.primary_type] : null;
  const secondary = dna && dna.secondary_type ? DNA_TYPES[dna.secondary_type] : null;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border-gradient px-5 py-5 text-center">
        <h2 className="text-lg font-bold tracking-tight text-gradient sm:text-xl">YOUR ADVENTURE STARTS HERE</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
          {model ? model.name : 'Your business'} is saved to your account. Here's the journey ahead — before you spend
          anything.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-left">
          <SpriteDisplay avatar={avatar} size="sm" />
          <div className="min-w-0">
            {typeof fit === 'number' && (
              <p className="font-mono text-[10px] font-bold tracking-wider text-primary">PERSONAL FIT {fit}/99</p>
            )}
            {primary && (
              <p className={`font-mono text-[10px] font-bold tracking-wider ${primary.accent}`}>
                {primary.label}
                {secondary ? ` + ${secondary.label}` : ''}
              </p>
            )}
          </div>
        </div>
        {model && model.first_validation_action && (
          <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-left">
            <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">SAMPLE FIRST QUEST</div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/90">{model.first_validation_action}</p>
          </div>
        )}
      </div>

      <AdventureStages />
      <PreviewVisuals />

      <Link
        to="/build"
        className="block w-full rounded-full bg-brand-gradient py-3.5 text-center text-sm font-bold tracking-wider text-white transition hover:scale-[1.01]"
      >
        CONTINUE TO MY BUILDER
      </Link>
    </section>
  );
}