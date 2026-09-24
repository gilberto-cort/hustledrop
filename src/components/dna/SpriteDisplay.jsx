import React from 'react';
import { Image } from '@/components/ui/image';
import CharacterSprite from '@/components/characters/CharacterSprite';
import { DNA_TYPES } from '@/lib/dnaDisplay';
import { identityFromAvatar, getCharacterAsset } from '@/lib/characterAssets';

// Single render path for the user's character across the whole app (DNA,
// Match, Build, Launch, Grow). Resolution order:
//   1. NEON HUSTLE library asset — once MANIFEST_ACTIVE is true and the
//      artwork is uploaded (identity comes from the user's own Avatar
//      selection; never inferred from the profile). Any slot still missing
//      falls back INSIDE CharacterSprite to the Avatar record's artwork,
//      so identities can be replaced one at a time.
//   2. The Avatar record's current sprite artwork — unchanged until then
//   3. The labelled DNA-monogram placeholder
// Artwork: transparent PNG/WebP rendered with object-fit CONTAIN — characters
// are never cropped. Pixel edges are preserved (no blur, no aggressive
// upscaling).
export default function SpriteDisplay({ avatar, size = 'md', pose = 'idle' }) {
  const meta = DNA_TYPES[avatar?.dna_type] || {};
  const slot = `${meta.code || '?'}-${avatar?.presentation === 'feminine' ? 'F' : 'M'}`;
  const box = size === 'lg' ? 'h-36 w-36' : size === 'sm' ? 'h-14 w-14' : 'h-24 w-24';

  // 1 — official asset library (inactive until real artwork is uploaded)
  const identity = identityFromAvatar(avatar);
  const manifestUrl = getCharacterAsset(identity, pose) || getCharacterAsset(identity, 'idle');
  if (manifestUrl) {
    return (
      <div className={`${box} overflow-hidden rounded-lg border-2 border-white/20 bg-white/[0.03]`}>
        <CharacterSprite
          identity={identity}
          pose={pose}
          alt={avatar.display_name || slot}
          fallbackUrl={avatar.sprite_asset}
        />
      </div>
    );
  }

  // 2 — current artwork on the Avatar record
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