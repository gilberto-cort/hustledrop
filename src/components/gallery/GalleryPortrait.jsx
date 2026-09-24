import React from 'react';
import { Image } from '@/components/ui/image';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// GALLERY PORTRAIT — Character Gallery artwork deliberately comes from the
// Avatar records' approved artwork (high-resolution portraits), SEPARATE
// from the gameplay sprite library (48×48 manifest assets). The newly
// uploaded Digital Builder prototype PNGs stay on disk untouched but are
// not displayed here until approved replacement artwork lands. Fallback:
// the shared labelled placeholder when a record has no artwork.
export default function GalleryPortrait({ avatar, size = 'lg' }) {
  const meta = DNA_TYPES[avatar?.dna_type] || {};
  const slot = `${meta.code || '?'}-${avatar?.presentation === 'feminine' ? 'F' : 'M'}`;
  const box = size === 'lg' ? 'h-36 w-36' : size === 'sm' ? 'h-14 w-14' : 'h-24 w-24';

  if (avatar?.sprite_asset) {
    return (
      <div className={`${box} overflow-hidden rounded-lg border-2 border-white/20 bg-white/[0.03]`}>
        <Image
          src={avatar.sprite_asset}
          alt={avatar.display_name || slot}
          fittingType="fit"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${box} flex flex-col items-center justify-center rounded-lg border-2 bg-brand-gradient-soft text-center ${
        meta.chip || 'border-white/20'
      }`}
    >
      <span className="font-mono text-xl font-bold text-foreground/80">{slot}</span>
      <span
        className={`mt-0.5 px-1 font-mono text-[8px] font-bold uppercase leading-tight ${
          meta.accent || 'text-muted-foreground'
        }`}
      >
        {(meta.label || 'HUSTLE DNA').split(' ')[0]}
      </span>
    </div>
  );
}