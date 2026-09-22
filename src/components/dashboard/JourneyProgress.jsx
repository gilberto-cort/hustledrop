import React, { useState } from 'react';
import { Check, Lock, Circle } from 'lucide-react';
import { STAGE_ORDER } from '@/lib/progression';

const STEPS = [
  { key: 'discover', label: 'DISCOVER' },
  { key: 'dna', label: 'DNA' },
  { key: 'match', label: 'MATCH' },
  { key: 'select', label: 'SELECT' },
  { key: 'build', label: 'BUILD' },
  { key: 'launch', label: 'LAUNCH' },
  { key: 'grow', label: 'GROW' },
];

// Each journey step belongs to one progression stage — the same resolver the
// Dashboard badge and Next Move use decides which steps are complete, current
// or locked, so this tracker can never contradict the rest of the app.
const STEP_STAGE = {
  discover: 'DISCOVER',
  dna: 'DISCOVER',
  match: 'DISCOVER',
  select: 'FOUNDER',
  build: 'BUILD',
  launch: 'LAUNCH',
  grow: 'GROW',
};

const UNLOCK_HINTS = {
  discover: 'Take HustleMatch to begin your journey.',
  dna: 'Complete HustleMatch to reveal your HustleDNA.',
  match: 'Finish HustleMatch to see your top business matches.',
  select: 'Pick the business you want to build from your matches.',
  build: 'Unlock the Business Builder to start building your selected business.',
  launch: 'Finish all six Builder modules to enter Launch Mode.',
  grow: 'Record your first real customer in Launch Mode to open Grow.',
};

export default function JourneyProgress({ journey = {}, stage }) {
  const [hint, setHint] = useState(null);
  const stageIndex = Math.max(0, STAGE_ORDER.indexOf(stage));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">YOUR JOURNEY</div>
      <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">
        Find your hustle. Build it. Launch it. Get your first customer. Then grow what works.
      </p>
      <div className="mt-4 flex flex-wrap items-start justify-center gap-x-2 gap-y-4 sm:flex-nowrap sm:justify-between">
        {STEPS.map((s) => {
          const complete = !!journey[s.key];
          const stepStageIndex = STAGE_ORDER.indexOf(STEP_STAGE[s.key]);
          const current = !complete && stepStageIndex === stageIndex;
          const locked = !complete && stepStageIndex > stageIndex;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => (complete ? setHint(null) : setHint(hint === s.key ? null : s.key))}
              className="flex min-w-[64px] flex-1 flex-col items-center gap-1.5"
              aria-label={`${s.label}${locked ? ' (locked)' : ''}`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  complete
                    ? 'bg-brand-gradient text-white'
                    : current
                      ? 'border border-primary/60 bg-primary/10 text-primary glow-primary'
                      : locked
                        ? 'border border-white/15 bg-white/[0.03] text-muted-foreground/50'
                        : 'border border-white/20 bg-white/[0.03] text-muted-foreground'
                }`}
              >
                {complete ? (
                  <Check className="h-4 w-4" />
                ) : locked ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-2.5 w-2.5 fill-current" />
                )}
              </span>
              <span
                className={`font-mono text-[10px] font-bold tracking-wider ${
                  complete ? 'text-foreground' : current ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
      {hint && (
        <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
          {UNLOCK_HINTS[hint]}
        </p>
      )}
    </div>
  );
}