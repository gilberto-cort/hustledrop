import React from 'react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// Gamification foundation — future levels unlock only through real milestones.
export const AVATAR_LEVELS = [
  { level: 1, name: 'EXPLORER' },
  { level: 2, name: 'FOUNDER' },
  { level: 3, name: 'LAUNCHER' },
  { level: 4, name: 'ENTREPRENEUR' },
];

// CHOOSE YOUR CHARACTER — cosmetic masculine/feminine sprite presentations for
// the user's PRIMARY type. Presentation NEVER affects scoring, matching,
// eligibility or pricing.
export default function CharacterPicker({ dnaType, avatars, selectedAvatarId, onSelect }) {
  const meta = DNA_TYPES[dnaType];
  const options = (avatars || []).filter((a) => a.dna_type === dnaType && a.active !== false);

  return (
    <div className="rounded-2xl border-2 border-white/15 bg-white/[0.02] p-6">
      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">CHOOSE YOUR CHARACTER</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded border border-white/20 bg-white/5 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary">LEVEL 1 · EXPLORER</span>
        <span className="font-mono text-[10px] text-muted-foreground">future levels unlock with real milestones</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {options.map((avatar) => {
          const active = selectedAvatarId === avatar.id;
          return (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition ${
                active ? meta.chip : 'border-white/10 bg-white/[0.02] hover:border-white/25'
              }`}
            >
              <SpriteDisplay avatar={avatar} size="lg" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/90">{avatar.presentation}</span>
              <span className={`font-mono text-[9px] font-bold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                {active ? 'SELECTED' : 'SELECT'}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground">
        Presentation is cosmetic only — it never affects your HustleDNA score, HustleMatch results, eligibility, ranking or pricing. Future skin tones, hairstyles, outfits and accessories will arrive here.
      </p>
    </div>
  );
}