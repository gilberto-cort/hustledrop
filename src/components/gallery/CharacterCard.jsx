import React from 'react';
import { Check } from 'lucide-react';
import GalleryPortrait from '@/components/gallery/GalleryPortrait';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// One gallery tile — strictly view-only: tapping opens the detail dialog,
// never selects or unlocks the character.
export default function CharacterCard({ avatar, selected, onOpen }) {
  const meta = DNA_TYPES[avatar.dna_type] || {};
  return (
    <button
      onClick={() => onOpen(avatar)}
      className={`flex w-full flex-col items-center rounded-xl border-2 p-4 text-center transition outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? 'border-primary/60 bg-brand-gradient-soft'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25'
      }`}
    >
      <GalleryPortrait avatar={avatar} size="lg" />
      <div className="mt-3 font-mono text-xs font-bold tracking-wider text-foreground">{meta.label || 'HUSTLE DNA'}</div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {avatar.presentation}
      </div>
      {selected ? (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest text-primary">
          <Check className="h-2.5 w-2.5" /> YOUR CHARACTER
        </span>
      ) : (
        <span className="mt-2 font-mono text-[8px] font-bold tracking-widest text-muted-foreground/60">VIEW</span>
      )}
    </button>
  );
}