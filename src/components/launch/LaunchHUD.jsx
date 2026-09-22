import React from 'react';
import { Trophy, Flame, Target } from 'lucide-react';
import { XP_GOAL, ACHIEVEMENTS } from '@/lib/launchService';
import { DNA_TYPES, levelName } from '@/lib/dnaDisplay';

function Counter({ label, value, target }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5 text-center">
      <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-sm font-bold text-foreground">
        {value}
        <span className="text-muted-foreground"> / {target}</span>
      </div>
    </div>
  );
}

// Launch HUD: business, level, DNA, XP (no monetary value), live counters,
// streak and achievements — all measured from real launch actions.
export default function LaunchHUD({ businessName, dna, quest, stats, achievements }) {
  const level = quest.level || stats.level || 3;
  const primary = dna ? DNA_TYPES[dna.primary_type] : null;
  const secondary = dna ? DNA_TYPES[dna.secondary_type] : null;
  const earned = (achievements || []).map((a) => a.achievement_type);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{businessName}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold tracking-wider text-primary">
              LV. {level} — {levelName(level).toUpperCase()}
            </span>
            {primary && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {primary.label.toUpperCase()} • {(secondary?.label || '').toUpperCase()}
              </span>
            )}
          </div>
        </div>
        {(quest.streak || 0) > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] font-bold text-foreground">
            <Flame className="h-3.5 w-3.5 text-accent" />
            {quest.streak} DAY ACTION STREAK
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground">
          <span>XP</span>
          <span className="font-mono">
            {stats.xp} / {XP_GOAL}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((stats.xp / XP_GOAL) * 100))}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">XP tracks real launch actions only — it has no monetary value.</p>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-brand-gradient-soft px-4 py-3">
        <Target className="h-4 w-4 shrink-0 text-primary" />
        <div>
          <div className="text-[9px] font-bold tracking-widest text-muted-foreground">MAIN QUEST</div>
          <div className="font-mono text-xs font-bold tracking-wider text-foreground">GET YOUR FIRST CUSTOMER</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Counter label="QUALIFIED PROSPECTS" value={stats.prospectCount} target={10} />
        <Counter label="OUTREACH SENT" value={stats.contactedCount} target={10} />
        <Counter label="CONVERSATIONS" value={stats.conversationCount} target={3} />
        <Counter label="LEADS" value={stats.leadCount} target={1} />
        <Counter label="CUSTOMERS" value={stats.customerCount} target={1} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-yellow-500" />
        <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
          ACHIEVEMENTS {earned.length}/{Object.keys(ACHIEVEMENTS).length}
        </span>
        {earned.map((type) => (
          <span
            key={type}
            className="rounded-sm border-2 border-white/20 bg-white/5 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-foreground/90"
            style={{ imageRendering: 'pixelated' }}
          >
            {ACHIEVEMENTS[type]?.label || type}
          </span>
        ))}
      </div>
    </div>
  );
}