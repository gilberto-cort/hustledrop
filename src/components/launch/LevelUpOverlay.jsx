import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

// FIRST CUSTOMER celebration: quest complete, +1000 XP, LEVEL UP to
// LV. 4 ENTREPRENEUR, Grow unlocked.
export default function LevelUpOverlay({ onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.35 },
        colors: ['#a855f7', '#ec4899', '#f97316'],
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4">
      <div className="w-full max-w-sm rounded-2xl border-2 border-primary/40 bg-brand-gradient-soft p-6 text-center">
        <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary">FIRST CUSTOMER</div>
        <h2 className="mt-3 text-2xl font-bold text-gradient">ACHIEVEMENT UNLOCKED</h2>
        <div className="mt-2 font-mono text-sm font-bold text-foreground">QUEST COMPLETE · +1000 XP</div>
        <div className="mt-5 space-y-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground">LEVEL UP</div>
          <div className="font-mono text-sm text-muted-foreground line-through">LV. 3 LAUNCHER</div>
          <div className="font-mono text-lg font-bold text-gradient">LV. 4 ENTREPRENEUR</div>
        </div>
        <div className="mt-4 font-mono text-xs font-bold tracking-[0.25em] text-primary">ENTREPRENEUR UNLOCKED</div>
        <div className="mt-2 inline-block rounded-full border border-primary/40 bg-brand-gradient-soft px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-primary">
          BUSINESS STATUS: LAUNCHED
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          One real payment validates more than a hundred plans. You proved someone will pay.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            to="/grow"
            onClick={onClose}
            className="rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            ENTER GROW MODE
          </Link>
          <button
            onClick={onClose}
            className="rounded-full border border-white/15 py-3 text-sm font-semibold text-foreground"
          >
            STAY IN LAUNCH
          </button>
        </div>
      </div>
    </div>
  );
}