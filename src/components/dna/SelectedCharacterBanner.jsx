import React from 'react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import { DNA_TYPES, levelName } from '@/lib/dnaDisplay';

// Prominent display of the chosen character near the top of the DNA profile.
export default function SelectedCharacterBanner({ avatar, dnaType }) {
  const meta = DNA_TYPES[dnaType];
  if (!avatar) return null;

  return (
    <div className={`flex items-center gap-4 rounded-2xl border-2 p-4 ${meta.chip}`}>
      <SpriteDisplay avatar={avatar} size="md" />
      <div className="min-w-0">
        <div className="font-mono text-[9px] font-bold tracking-widest text-primary">
          LEVEL {avatar.level || 1} · {levelName(avatar.level).toUpperCase()}
        </div>
        <div className={`mt-0.5 font-mono text-sm font-bold ${meta.accent}`}>{meta.label}</div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{avatar.presentation}</div>
      </div>
      <p className="ml-auto hidden max-w-[190px] text-right font-mono text-[8px] leading-relaxed text-muted-foreground sm:block">
        Character choice is cosmetic and does not affect your HustleDNA or HustleMatch.
      </p>
    </div>
  );
}