import React from 'react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import { DNA_TYPES, levelName } from '@/lib/dnaDisplay';

// RPG-style character selection. Only the two base characters of the user's
// PRIMARY HustleDNA class are shown — never unrelated classes.
// Future cosmetic layers (skin tone, hair, outfit, accessory, background,
// badge, aura, trophy) extend the Avatar record without touching dna_type
// or matching logic.
export default function CharacterPicker({ dnaType, avatars, selectedAvatarId, onSelect }) {
  const meta = DNA_TYPES[dnaType];
  const options = (avatars || []).filter((a) => a.dna_type === dnaType && a.active !== false);

  return (
    <div className="rounded-2xl border-2 border-white/15 bg-white/[0.02] p-6">
      <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">CHOOSE YOUR CHARACTER</div>
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
        Character choice is cosmetic and does not affect your HustleDNA or HustleMatch.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {options.map((avatar) => {
          const active = selectedAvatarId === avatar.id;
          return (
            <div
              key={avatar.id}
              className={`flex flex-col items-center rounded-xl border-2 p-4 text-center ${
                active ? meta.chip : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <SpriteDisplay avatar={avatar} size="lg" />
              <div className="mt-3 font-mono text-xs font-bold tracking-wider text-foreground">{meta.label}</div>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{avatar.presentation}</div>
              <div className="mt-2 rounded border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-primary">
                LEVEL {avatar.level || 1} · {levelName(avatar.level).toUpperCase()}
              </div>
              <button
                onClick={() => onSelect(avatar.id)}
                className={`mt-3 w-full rounded-md border px-3 py-1.5 font-mono text-[10px] font-bold tracking-widest transition ${
                  active ? `${meta.accent} border-white/25 bg-white/10` : 'border-white/15 text-muted-foreground hover:text-foreground'
                }`}
              >
                {active ? 'SELECTED' : 'SELECT'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}