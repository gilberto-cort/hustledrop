import React from 'react';
import { Lock } from 'lucide-react';

// Quest-map / XP / achievement PREVIEWS — deliberately empty. No fake XP, no
// unlocked achievements, no invented customers: game progress only ever comes
// from completing real-world business actions.
export default function PreviewVisuals() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">PROGRESSION PREVIEW</div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9px] font-bold tracking-widest text-primary">XP</span>
          <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">STARTS AT 0</span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-0 rounded-full bg-brand-gradient" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        {[0, 1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            <span
              className={`h-2.5 w-2.5 rounded-full border ${
                i === 0 ? 'border-primary bg-primary/30' : 'border-white/20 bg-white/5'
              }`}
            />
            {i < 4 && <span className="w-4 border-t border-dashed border-white/20" />}
          </React.Fragment>
        ))}
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        QUEST MAP — each node is a real-world mission.
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {['FIRST MOVE', 'MARKET SIGNAL', 'FIRST CUSTOMER'].map((a) => (
          <span
            key={a}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-muted-foreground"
          >
            <Lock className="h-2.5 w-2.5" />
            {a}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        XP and achievements come only from completing real-world business actions — never from tapping around the app.
      </p>
    </div>
  );
}