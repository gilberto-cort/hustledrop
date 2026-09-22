import React from 'react';

const LINES = [
  'Understanding your customer',
  'Designing the offer',
  'Building pricing',
  'Preparing your brand',
  'Creating your sales plan',
  'Building your marketing',
];

// Real-time generation state. Modules are only marked done when they are
// actually accepted; the generating module pulses until the request resolves.
export default function GenerationOverlay({ acceptedMap, activeIndex, label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="text-center font-mono text-xs font-bold tracking-[0.3em] text-muted-foreground">
        BUILDING YOUR BUSINESS…
      </div>
      <div className="mt-5 space-y-2">
        {LINES.map((line, i) => {
          const isActive = i === activeIndex;
          const done = acceptedMap[i];
          return (
            <div
              key={line}
              className={`flex items-center gap-3 rounded-xl border p-3.5 ${
                isActive ? 'border-primary/40 bg-brand-gradient-soft' : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  done ? 'bg-brand-gradient text-white' : isActive ? 'bg-primary/30 text-foreground' : 'bg-white/5 text-muted-foreground/50'
                }`}
              >
                {done ? '✓' : isActive ? '●' : '○'}
              </span>
              <span className={`text-sm ${isActive || done ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                {line}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Generating your {label.toLowerCase()} module now. Nothing is marked complete until generation actually
        succeeds — this can take a moment.
      </p>
    </div>
  );
}