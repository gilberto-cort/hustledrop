import React, { useEffect, useState } from 'react';
import { getCharacterAsset, getCharacterAnimation, SPRITE_FRAME, PORTRAIT_FRAME } from '@/lib/characterAssets';

// ============================================================
// CHARACTER SPRITE — pixel-perfect renderer for the NEON HUSTLE library.
//
//  - Resolution: animated sheet (once MANIFEST_ANIMATIONS_ACTIVE and the
//    sheets are uploaded), then the static <pose> asset, then the
//    identity's idle asset, then the caller-supplied fallbackUrl (the
//    Avatar record's current artwork), then nothing (the caller shows its
//    labelled placeholder). A missing or failed file never breaks a page,
//    so artwork can be verified and integrated incrementally — unfinished
//    identities keep their existing artwork.
//  - Pixel-perfect: `scale` renders the source frame at an exact integer
//    multiple (scale 3 → 144px for a 48px sprite) — no blurry CSS scaling.
//    Without `scale` it fills its container with object-contain + pixelated.
//  - Animation: sprite sheets play through pure CSS steps() over the
//    background position — no cumulative JS timers, and frame boundaries
//    stay pixel-exact at any container size. Frozen on frame 0 (which
//    matches the static pose) under prefers-reduced-motion or when
//    `animated` is false. Sheet loading failures can't be detected on a
//    background-image, so MANIFEST_ANIMATIONS_ACTIVE must stay false until
//    the sheets are actually uploaded.
// ============================================================
export default function CharacterSprite({
  identity,
  pose = 'idle',
  scale,
  animated = true,
  alt,
  className = '',
  boxClassName = '',
  fallbackUrl,
}) {
  const anim = animated ? getCharacterAnimation(identity, pose) : null;
  const poseUrl = getCharacterAsset(identity, pose);
  const idleUrl = pose !== 'idle' ? getCharacterAsset(identity, 'idle') : null;

  // First candidate that hasn't failed to load wins — the Avatar record's
  // current artwork is the last resort, keeping partial libraries safe.
  const candidates = [poseUrl || idleUrl, fallbackUrl].filter(Boolean);
  const [failedSrc, setFailedSrc] = useState(null);

  // Reset the failure flag whenever the underlying asset changes.
  useEffect(() => {
    setFailedSrc(null);
  }, [anim && anim.url, poseUrl, idleUrl, fallbackUrl]);

  const src = candidates.find((c) => c !== failedSrc) || null;

  const frame = pose === 'portrait' ? PORTRAIT_FRAME : SPRITE_FRAME;
  const fixed = Number.isInteger(scale) && scale > 0;
  const boxStyle = fixed ? { width: frame * scale, height: frame * scale } : undefined;
  const sizing = fixed ? '' : 'h-full w-full';

  // Animated sheet — percentage-based background math works at any container
  // size; steps() keeps frame boundaries pixel-exact.
  if (anim) {
    return (
      <div
        role="img"
        aria-label={alt || (identity ? `${identity} — ${pose}` : 'character animation')}
        style={{
          ...boxStyle,
          backgroundImage: `url(${anim.url})`,
          backgroundSize: `${anim.frames * 100}% 100%`,
          '--sheet-steps': anim.frames - 1,
          '--sheet-duration': `${(anim.frames - 1) / anim.fps}s`,
        }}
        className={`pixelated sprite-sheet ${sizing} ${boxClassName}`}
      />
    );
  }

  if (!src) return null;

  return (
    <div
      className={`flex items-center justify-center ${sizing} ${boxClassName}`}
      style={boxStyle}
    >
      <img
        src={src}
        alt={alt || (identity ? `${identity} — ${pose}` : 'character sprite')}
        onError={() => setFailedSrc(src)}
        draggable={false}
        className={`pixelated h-full w-full ${fixed ? '' : 'object-contain'} ${
          animated && pose === 'idle'
            ? 'animate-[sprite-bob_1.6s_steps(2,end)_infinite] motion-reduce:animate-none'
            : ''
        } ${className}`}
      />
    </div>
  );
}