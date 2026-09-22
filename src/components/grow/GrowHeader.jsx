import React from 'react';
import { Trophy, Flame, Target } from 'lucide-react';
import { DNA_TYPES, levelName } from '@/lib/dnaDisplay';
import { ACHIEVEMENTS } from '@/lib/launchService';
import SpriteDisplay from '@/components/dna/SpriteDisplay';

// Grow player header — the persistent HustleDrop identity: business, level,
// HustleDNA, avatar, XP, streak and the Road-to-5 main quest. Every value
// comes from real persistent records.
export default function GrowHeader({
  businessName, dna, avatar, level, xp, xpGoal, streak, customers, achievements,
}) {
  const primary = dna ? DNA_TYPES[dna.primary_type] : null;
  const secondary = dna ? DNA_TYPES[dna.secondary_type] : null;
  const earned = (achievements || []).map((a) => a.achievement_type);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div
          className={`shrink-0 rounded-xl ${
            level >= 5 ? 'shadow-[0_0_24px_rgba(168,85,247,0.45)]' : ''
          }`}
        >
          <SpriteDisplay avatar={avatar} size="md" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{businessName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-wider text-primary">
              LV. {level} — {levelName(level).toUpperCase()}
            </span>
            {primary && (
              <span className="font-mono text-[10px] text-muted-foreground">
                {primary.label.toUpperCase()} • {(secondary?.label || '').toUpperCase()}
              </span>
            )}
          </div>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground">
              <span>XP</span>
              <span className="font-mono">
                {xp} / {xpGoal}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand-gradient transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((xp / xpGoal) * 100))}%` }}
              />
            </div>
          </div>
          {(streak || 0) > 0 && (
            <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] font-bold text-foreground">
              <Flame className="h-3.5 w-3.5 text-accent" />
              {streak} DAY ACTION STREAK
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-brand-gradient-soft px-4 py-3">
        <Target className="h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-bold tracking-widest text-muted-foreground">MAIN QUEST</div>
          <div className="font-mono text-xs font-bold tracking-wider text-foreground">THE ROAD TO 5</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-bold tracking-widest text-muted-foreground">CUSTOMERS</div>
          <div className="font-mono text-sm font-bold text-primary">{Math.min(customers, 5)} / 5</div>
        </div>
      </div>

      {level < 5 && (
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          LV. 5 OPERATOR unlocks with 5 recorded customers and your accepted operating loop.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-yellow-500" />
        <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
          ACHIEVEMENTS {earned.length}/{Object.keys(ACHIEVEMENTS).length}
        </span>
        {earned.map((type) => (
          <span
            key={type}
            className="rounded-sm border-2 border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-foreground/90"
          >
            {ACHIEVEMENTS[type]?.label || type}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        XP tracks real completed business actions only — it has no monetary value.
      </p>
    </div>
  );
}