import React, { useEffect, useState } from 'react';
import { getCharacterAsset, SPRITE_FRAME, PORTRAIT_FRAME } from '@/lib/characterAssets';

// ============================================================
// CHARACTER SPRITE — pixel-perfect renderer for the NEON HUSTLE library.
//
//  - Resolution: <pose> asset, then the identity's idle asset, then nothing
//    (the caller shows its labelled fallback). A missing file never breaks
//    a page.
//  - Pixel-perfect: `scale` renders the source frame at an exact integer
//    multiple (scale 3 → 144px for a 48px sprite) — no blurry CSS scaling.
//    Without `scale` it fills its container with object-contain + pixelated.
//  - Animation: pure CSS (a 2px steps() bob on the idle pose) — no cumulative
//    JS timers to drift. Static fallback when `animated` is false; all
//    motion disabled under prefers-reduced-motion.
// ============================================================
export default function CharacterSprite({
  identity,
  pose = 'idle',
  scale,
  animated = true,
  alt,
  className = '',
  boxClassName = '',
}) {
  const poseUrl = getCharacterAsset(identity, pose);
  const idleUrl = pose !== 'idle' ? getCharacterAsset(identity, 'idle') : null;
  const [failed, setFailed] = useState(false);

  // Reset the failure flag whenever the underlying asset changes.
  useEffect(() => {
    setFailed(false);
  }, [poseUrl, idleUrl]);

  const url = poseUrl || idleUrl;
  if (!url || failed) return null;

  const frame = pose === 'portrait' ? PORTRAIT_FRAME : SPRITE_FRAME;
  const fixed = Number.isInteger(scale) && scale > 0;
  const boxStyle = fixed ? { width: frame * scale, height: frame * scale } : undefined;

  return (
    <div
      className={`flex items-center justify-center ${fixed ? '' : 'h-full w-full'} ${boxClassName}`}
      style={boxStyle}
    >
      <img
        src={url}
        alt={alt || (identity ? `${identity} — ${pose}` : 'character sprite')}
        onError={() => setFailed(true)}
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