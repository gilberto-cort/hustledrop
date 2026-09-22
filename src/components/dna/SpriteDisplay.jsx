import React from 'react';
import { Image } from '@/components/ui/image';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// Sprite container for the official HustleDrop pixel-art assets.
// Artwork: transparent PNG/WebP rendered with object-fit CONTAIN — characters
// are never cropped. Pixel edges are preserved (no blur, no aggressive
// upscaling). Until the official asset is assigned, a polished DNA-monogram
// token is shown — no developer placeholder text in the production UI.
export default function SpriteDisplay({ avatar, size = 'md' }) {
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
          className="pixelated h-full w-full object-contain"
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