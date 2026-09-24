import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { DNA_TYPES } from '@/lib/dnaDisplay';
import { identityFromAvatar, getGalleryPortrait } from '@/lib/characterAssets';

// GALLERY PORTRAIT — Character Gallery artwork chain:
//   1. The 16-bit gallery pack's gallery_portrait.png for the identity
//   2. The Avatar record's approved artwork
//   3. The labelled placeholder
// Gallery artwork is deliberately SEPARATE from gameplay sprites (the
// 48×48 manifest assets); gameplay animations stay disabled. View-only.
export default function GalleryPortrait({ avatar, size = 'lg' }) {
  const meta = DNA_TYPES[avatar?.dna_type] || {};
  const slot = `${meta.code || '?'}-${avatar?.presentation === 'feminine' ? 'F' : 'M'}`;
  const box = size === 'lg' ? 'h-36 w-36' : size === 'sm' ? 'h-14 w-14' : 'h-24 w-24';

  const identity = identityFromAvatar(avatar);
  const galleryUrl = getGalleryPortrait(identity);
  const [galleryFailed, setGalleryFailed] = useState(false);
  useEffect(() => {
    setGalleryFailed(false);
  }, [galleryUrl]);

  // 1 — gallery pack portrait
  if (galleryUrl && !galleryFailed) {
    return (
      <div className={`${box} overflow-hidden rounded-lg border-2 border-white/20 bg-white/[0.03]`}>
        <img
          src={galleryUrl}
          alt={avatar?.display_name || slot}
          onError={() => setGalleryFailed(true)}
          draggable={false}
          className="pixelated h-full w-full object-contain"
        />
      </div>
    );
  }

  // 2 — Avatar record's approved artwork
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

  // 3 — labelled placeholder
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