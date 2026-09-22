import React from 'react';
import { Check, Lock } from 'lucide-react';

// Journey progress. Completed steps reflect real state only — finishing the
// quiz never implies the user has launched a business. BUILD, LAUNCH and GROW
// are locked future phases.
const STEPS = [
  { key: 'discover', label: 'DISCOVER', future: false },
  { key: 'dna', label: 'DNA', future: false },
  { key: 'match', label: 'MATCH', future: false },
  { key: 'select', label: 'SELECT', future: false },
  { key: 'build', label: 'BUILD', future: false },
  { key: 'launch', label: 'LAUNCH', future: true },
  { key: 'grow', label: 'GROW', future: true },
];

export default function JourneyProgress({ discover, dna, match, selected, buildDone }) {
  const done = { discover, dna, match, select: selected, build: !!buildDone };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">YOUR JOURNEY</div>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STEPS.map((s) => {
          const complete = !s.future && !!done[s.key];
          return (
            <div key={s.key} className="flex min-w-[72px] flex-1 flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  complete
                    ? 'bg-brand-gradient text-white'
                    : 'border border-white/15 bg-white/[0.03] text-muted-foreground'
                }`}
              >
                {complete ? <Check className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}
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
        BUILD unlocks once you select a business. LAUNCH and GROW arrive in a future release — completing the quiz
        doesn't mean you've launched a business.
      </p>
    </div>
  );
}