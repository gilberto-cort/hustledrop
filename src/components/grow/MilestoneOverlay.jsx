import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

// Milestone celebrations for the Road to 5 — Customer #3 (PROOF OF MOTION)
// and Customer #5 (final Grow v1 boss). Tasteful: brand colors, no cash
// imagery, no success guarantees.
export default function MilestoneOverlay({ type, summary, onClose }) {
  const isFive = type === 'customer_5';

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

  const stat = (label, value) => (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-2 py-2 text-center">
      <div className="font-mono text-[8px] font-bold tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{value}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4">
      <div className="w-full max-w-sm rounded-2xl border-2 border-primary/40 bg-brand-gradient-soft p-6 text-center">
        <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary">
          {isFive ? '5 CUSTOMERS' : 'CUSTOMER #3'}
        </div>
        <h2 className="mt-3 text-2xl font-bold text-gradient">
          {isFive ? 'MILESTONE UNLOCKED' : 'ACHIEVEMENT UNLOCKED'}
        </h2>
        {!isFive && (
          <div className="mt-2 font-mono text-sm font-bold text-foreground">PROOF OF MOTION</div>
        )}
        {isFive && (
          <div className="mt-2 font-mono text-sm font-bold text-foreground">YOU'RE BUILDING MOMENTUM.</div>
        )}
        <div className="mt-2 font-mono text-xs font-bold text-primary">
          +{isFive ? 500 : 200} XP
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {isFive
            ? 'Five customers recorded. That is real activity worth learning from — not proof of long-term viability. Keep experimenting.'
            : '"You\'ve now recorded three customers. That\'s enough activity to start looking for patterns — not enough to assume the model is proven."'}
        </p>

        {isFive && summary && (
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {stat('CUSTOMERS', summary.customers)}
            {stat('SOURCES', summary.sources)}
            {stat('CONVERSATIONS', summary.conversations)}
            {stat('LEADS', summary.leads)}
            {stat('REFERRALS', summary.referrals)}
            {stat('REPEATS', summary.repeats)}
          </div>
        )}

        {isFive && (
          <div className="mt-4 rounded-xl border border-white/15 bg-white/[0.02] p-4">
            <div className="text-[10px] font-bold tracking-widest text-muted-foreground">NEXT CHAPTER</div>
            <div className="mt-1 font-mono text-base font-bold text-gradient">OPTIMIZE &amp; SCALE</div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
              The next world — turning five customers into a repeatable, growing operation — is coming in a future
              update. Your progress is saved.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          CONTINUE THE ROAD
        </button>
      </div>
    </div>
  );
}