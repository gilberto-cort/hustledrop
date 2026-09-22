import React from 'react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import { DNA_TYPES, levelName } from '@/lib/dnaDisplay';
import { BUILD_MODULES } from '@/lib/builderService';
import { MISSION_ACHIEVEMENTS, MAX_BUILD_XP } from './missions/missionMeta';
import { Lock } from 'lucide-react';

// BUILDER HUD — the persistent RPG header: the user's HustleDNA character,
// Founder level, the selected business, Build XP (derived from accepted
// missions — one idempotent award each, never from taps) and cosmetic
// achievement emblems. Nothing here grants or alters records.
export default function BuilderHUD({ businessName, fit, dna, avatar, acceptedKeys }) {
  const xp = acceptedKeys.length * 50;
  const primary = dna ? DNA_TYPES[dna.primary_type] : null;
  const level = avatar?.level || 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center gap-3.5">
        <SpriteDisplay avatar={avatar} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[9px] font-bold tracking-widest text-primary">
            LEVEL {level} · {levelName(level).toUpperCase()}
          </div>
          <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{businessName}</h1>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {fit != null && (
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-bold text-foreground">
                {fit}% FIT
              </span>
            )}
            {dna && (
              <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-bold text-foreground">
                DNA {dna.hustle_code}
              </span>
            )}
            {primary && <span className={`font-mono text-[9px] font-bold ${primary.accent}`}>{primary.label}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
          <span>BUILD XP</span>
          <span className="text-primary">{xp} / {MAX_BUILD_XP}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-700 motion-reduce:transition-none"
            style={{ width: `${(xp / MAX_BUILD_XP) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {BUILD_MODULES.map((m) => {
          const unlocked = acceptedKeys.includes(m.key);
          return (
            <span
              key={m.key}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold tracking-wider ${
                unlocked
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-white/10 bg-white/[0.02] text-muted-foreground/50'
              }`}
            >
              {unlocked ? null : <Lock className="h-2 w-2" />}
              {MISSION_ACHIEVEMENTS[m.key]}
            </span>
          );
        })}
      </div>
    </div>
  );
}