import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import GalleryPortrait from '@/components/gallery/GalleryPortrait';
import { DNA_TYPES, archetypeIdentity, archetypeStrength } from '@/lib/dnaDisplay';

// VIEW-ONLY character detail. Browsing never selects, unlocks or modifies
// anything — character selection stays on the HustleDNA page.
function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">{title}</div>
      <div className="mt-1.5 text-xs leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

export default function CharacterDetailDialog({ type, presentation, avatars, selectedAvatarId, categories, onOpenChange }) {
  const [shown, setShown] = useState(presentation);
  const meta = DNA_TYPES[type] || {};
  const avatar = avatars.find((a) => a.dna_type === type && a.presentation === shown) || null;
  const isSelected = !!avatar && avatar.id === selectedAvatarId;
  const cats = (categories && categories[type]) || [];

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-sm overflow-y-auto border-white/10 bg-card">
        <div className="text-center">
          <div className="font-mono text-[9px] font-bold tracking-[0.35em] text-muted-foreground">CHARACTER</div>
          <h3 className="mt-1 text-lg font-bold text-foreground">{meta.label || 'HUSTLE DNA'}</h3>
          {isSelected && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[8px] font-bold tracking-widest text-primary">
              <Check className="h-2.5 w-2.5" /> YOUR CURRENT CHARACTER
            </span>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <GalleryPortrait avatar={avatar} variant="card" />
        </div>

        {/* Male / female preview toggle — preview only, never a selection */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {['masculine', 'feminine'].map((p) => (
            <button
              key={p}
              onClick={() => setShown(p)}
              className={`rounded-full border py-2 font-mono text-[9px] font-bold tracking-widest transition ${
                shown === p
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-white/15 text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2.5">
          <Section title="OFFICIAL DESCRIPTION">{meta.core || '—'}</Section>
          <Section title="TYPICAL BUSINESS APPROACH">{archetypeIdentity(type) || '—'}</Section>
          <Section title="SIGNATURE STRENGTH">{archetypeStrength(type) || '—'}</Section>
          {cats.length > 0 && (
            <Section title="EXAMPLE HUSTLE CATEGORIES">
              <div className="flex flex-wrap gap-1.5">
                {cats.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-foreground/85"
                  >
                    {c.toUpperCase()}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        <p className="mt-4 text-center text-[10px] leading-relaxed text-muted-foreground">
          Viewing a character never changes your selection or unlocks anything. Character choice stays on your HustleDNA page.
        </p>
      </DialogContent>
    </Dialog>
  );
}