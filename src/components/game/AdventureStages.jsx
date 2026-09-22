import React from 'react';
import { Hammer, Rocket, TrendingUp } from 'lucide-react';

// Three-stage adventure preview — a deterministic template over the app's
// real mode structure (Build → Launch → Grow). Always labeled PREVIEW;
// nothing here implies earned progress or results.
const STAGES = [
  { level: 2, name: 'BUILD', Icon: Hammer, desc: 'Create your offer, pricing, brand and sales kit.' },
  { level: 3, name: 'LAUNCH', Icon: Rocket, desc: 'Complete real-world quests on the way to your first customer.' },
  { level: 4, name: 'GROW', Icon: TrendingUp, desc: 'Unlock a new world after your first customer and work toward five.' },
];

export default function AdventureStages() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-baseline justify-between">
        <div className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">YOUR ADVENTURE</div>
        <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest text-muted-foreground">
          PREVIEW
        </span>
      </div>
      <div className="relative mt-4">
        <div className="absolute left-[16%] right-[16%] top-5 border-t border-dashed border-white/15" />
        <div className="relative grid grid-cols-3 gap-2">
          {STAGES.map((s) => (
            <div key={s.name} className="flex flex-col items-center text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-brand-gradient-soft text-primary">
                <s.Icon className="h-5 w-5" />
              </div>
              <div className="mt-2 font-mono text-[9px] font-bold tracking-widest text-primary">LEVEL {s.level}</div>
              <div className="text-xs font-bold tracking-wider text-foreground">{s.name}</div>
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}