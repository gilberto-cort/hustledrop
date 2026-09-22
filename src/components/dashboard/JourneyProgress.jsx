import React from 'react';
import { Check, Lock, Circle } from 'lucide-react';

// Journey progress. Completed steps reflect real state only — finishing the
// quiz never implies the user has launched a business. LAUNCH completes at
// the first real customer; GROW unlocks after that.
const STEPS = [
  { key: 'discover', label: 'DISCOVER' },
  { key: 'dna', label: 'DNA' },
  { key: 'match', label: 'MATCH' },
  { key: 'select', label: 'SELECT' },
  { key: 'build', label: 'BUILD' },
  { key: 'launch', label: 'LAUNCH' },
  { key: 'grow', label: 'GROW' },
];

export default function JourneyProgress({ discover, dna, match, selected, buildDone, launchDone, growUnlocked }) {
  const done = {
    discover,
    dna,
    match,
    select: selected,
    build: !!buildDone,
    launch: !!launchDone,
    grow: false, // Grow system arrives in a future update
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">YOUR JOURNEY</div>
      <div className="mt-4 flex flex-wrap items-start justify-center gap-x-2 gap-y-4 sm:flex-nowrap sm:justify-between">
        {STEPS.map((s) => {
          const locked = s.key === 'grow' && !growUnlocked;
          const complete = !!done[s.key];
          return (
            <div key={s.key} className="flex min-w-[64px] flex-1 flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  complete
                    ? 'bg-brand-gradient text-white'
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
                  complete ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        LAUNCH counts your first real customer. GROW unlocks after your first customer — first prove the offer, then
        make it repeatable.
      </p>
    </div>
  );
}