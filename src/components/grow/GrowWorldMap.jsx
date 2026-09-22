import React from 'react';
import { Check, Lock, Crown } from 'lucide-react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';

// Grow world map — a new area, not a repeat of the Launch checklist: a
// glowing road of checkpoints from Customer #1 to Customer #5. The player's
// HustleDNA sprite stands at their current checkpoint.
export default function GrowWorldMap({ stats, avatar, onOpenMission }) {
  const activeIndex = stats.activeIndex;
  const last = stats.missionStates.length - 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary">THE ROAD TO 5</span>
        <span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">WORLD 02 — GROW</span>
      </div>

      {stats.missionStates.map((m, i) => {
        const clickable = i <= activeIndex;
        const isFinal = m.type === 'customer_5';
        return (
          <div key={m.type}>
            {i === activeIndex && (
              <div className="relative z-10 mb-1 flex items-center gap-2">
                <SpriteDisplay avatar={avatar} size="sm" />
                <span className="rounded-full border border-primary/40 bg-brand-gradient-soft px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest text-primary">
                  YOU ARE HERE
                </span>
              </div>
            )}
            <button
              disabled={!clickable}
              onClick={() => clickable && onOpenMission(m.type)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                m.completed
                  ? 'border-gradient glow-primary'
                  : i === activeIndex
                    ? 'border-primary/50 bg-brand-gradient-soft shadow-[0_0_24px_rgba(168,85,247,0.3)] hover:scale-[1.01]'
                    : 'border-white/10 bg-white/[0.02] opacity-50'
              } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 ${
                  m.completed
                    ? 'border-primary/60 bg-primary/15 text-primary'
                    : i === activeIndex
                      ? 'border-accent/60 bg-accent/10 text-accent'
                      : 'border-white/15 text-muted-foreground'
                }`}
              >
                {m.completed ? (
                  <Check className="h-5 w-5" />
                ) : isFinal ? (
                  <Crown className="h-5 w-5" />
                ) : i === activeIndex ? (
                  <span className="font-mono text-xs font-bold text-accent">{String(i + 1).padStart(2, '0')}</span>
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-mono text-xs font-bold tracking-wider text-foreground">
                  {m.node}
                </span>
                <span className="mt-0.5 block font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
                  {m.milestone ? `${m.current_count} / ${m.target} CUSTOMERS` : m.completed ? 'COMPLETE' : i === activeIndex ? 'ACTIVE QUEST' : 'LOCKED'}
                </span>
              </span>
              {m.xp > 0 && (
                <span className="font-mono text-[9px] font-bold text-primary">+{m.xp} XP</span>
              )}
            </button>
            {i < last && (
              <div
                className={`ml-[21px] h-6 w-0.5 rounded ${
                  m.completed
                    ? 'bg-gradient-to-b from-primary via-accent to-orange-400 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                    : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}