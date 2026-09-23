import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flame, Swords, Sunrise } from 'lucide-react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';

// Small victory animation — a completed daily quest or a defeated weekly
// boss. Same DNA character and visual language as the rest of the game;
// XP only, never a monetary reward.
export default function DailyVictoryOverlay({ victory, avatar, onClose }) {
  useEffect(() => {
    if (!victory) return undefined;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [victory, onClose]);

  const boss = victory && victory.kind === 'boss';

  return (
    <AnimatePresence>
      {victory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ scale: 0.85, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="w-full max-w-xs rounded-2xl border-gradient glow-primary p-6 text-center"
          >
            {avatar ? (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: 1, duration: 0.5 }}
                className="mx-auto w-fit motion-reduce:animate-none"
              >
                <SpriteDisplay avatar={avatar} size="lg" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: 1, duration: 0.5 }}
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft text-primary motion-reduce:animate-none"
              >
                {boss ? <Swords className="h-7 w-7" /> : <Sunrise className="h-7 w-7" />}
              </motion.div>
            )}
            <div className="mt-4 font-mono text-[10px] font-bold tracking-[0.3em] text-primary">
              {boss ? 'WEEKLY BOSS DEFEATED' : 'DAILY QUEST COMPLETE'}
            </div>
            <div className="mt-2 text-3xl font-bold text-gradient">+{boss ? 50 : 25} XP</div>
            {!boss && (victory.streak || 0) > 1 && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] font-bold text-foreground">
                <Flame className="h-3.5 w-3.5 text-accent" />
                {victory.streak} DAY STREAK
              </div>
            )}
            <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
              Recorded from your real pipeline — XP has no monetary value.
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-full border border-white/15 px-5 py-1.5 font-mono text-[10px] font-bold tracking-widest text-foreground transition hover:border-primary/40"
            >
              KEEP GOING
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}