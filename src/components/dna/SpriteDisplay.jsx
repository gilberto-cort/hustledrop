import React from 'react';
import { Image } from '@/components/ui/image';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// Sprite container for the official HustleDrop pixel-art assets.
// Artwork: transparent PNG/WebP rendered with object-fit CONTAIN — characters
// are never cropped. Pixel edges are preserved (no blur, no aggressive
// upscaling). Until an asset is assigned, a clearly-labelled placeholder slot
// is shown — no substitute artwork is generated.
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
    <div className={`${box} flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white/[0.03] text-center ${meta.chip || 'border-white/20'}`}>
      <span className="font-mono text-lg font-bold text-foreground/70">{slot}</span>
      <span className="mt-1 px-1 font-mono text-[8px] uppercase leading-tight text-muted-foreground">sprite pending upload</span>
    </div>
  );
}