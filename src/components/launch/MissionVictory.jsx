import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, Sprout } from 'lucide-react';

// QUEST COMPLETE — a short celebration, then straight back to the next
// real-world move. Respects reduced motion.
export default function MissionVictory({ mission, next, onClose }) {
  const reduce = useReducedMotion();

  // Short celebratory burst — never fired under reduced motion.
  useEffect(() => {
    if (reduce) return undefined;
    const timer = setTimeout(() => {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.4 }, colors: ['#a855f7', '#ec4899', '#f97316'] });
    }, 200);
    return () => clearTimeout(timer);
  }, [reduce]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4">
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm rounded-2xl border-2 border-primary/40 bg-brand-gradient-soft p-6 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-primary/50 bg-brand-gradient-soft glow-primary">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <div className="mt-2 font-mono text-[10px] font-bold tracking-[0.3em] text-primary">QUEST COMPLETE</div>
        <h2 className="mt-2 text-xl font-bold tracking-tight text-gradient">{mission.title}</h2>
        {mission.xp > 0 && (
          <div className="mt-1.5 font-mono text-sm font-bold text-foreground">+{mission.xp} XP</div>
        )}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          {next ? (
            <>
              <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">NEXT QUEST UNLOCKED</div>
              <div className="mt-1 font-mono text-sm font-bold tracking-wider text-foreground">{next.title}</div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 font-mono text-sm font-bold text-gradient">
              <Sprout className="h-4 w-4 text-primary" />
              GROW MODE UNLOCKED
            </div>
          )}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Your character moved forward on the map. The next real-world move is one tap away.
        </p>
        <button
          onClick={onClose}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white transition hover:scale-[1.02] motion-reduce:transition-none"
        >
          CONTINUE
          {next && <ArrowRight className="h-4 w-4" />}
        </button>
      </motion.div>
    </div>
  );
}