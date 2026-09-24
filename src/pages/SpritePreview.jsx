import React from 'react';
import CharacterSprite from '@/components/characters/CharacterSprite';
import { ANIMATIONS } from '@/lib/characterAssets';

// Preview of the two verified Digital Builder idle sprite-sheet animations.
// View-only: no selection, no progression, no logic.
const IDENTITIES = [
  { key: 'digital_builder_male', label: 'DIGITAL BUILDER — MASCULINE' },
  { key: 'digital_builder_female', label: 'DIGITAL BUILDER — FEMININE' },
];

function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[10px] text-foreground/90">{value}</span>
    </div>
  );
}

export default function SpritePreview() {
  const spec = ANIMATIONS.idle;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-wider text-foreground">IDLE ANIMATION PREVIEW</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Digital Builder pack — the only identities with verified sheets. All other characters keep their existing artwork.
        </p>
        <p className="mt-2 rounded-lg border border-dashed border-white/15 p-2.5 text-center text-[10px] leading-relaxed text-muted-foreground">
          The experimental 48×48 gameplay sprites are temporarily disabled — these frames fall back to the approved Avatar artwork. The verified sheets and animation code are preserved for future re-enable.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {IDENTITIES.map((c) => (
          <div key={c.key} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="font-mono text-[10px] font-bold tracking-widest text-primary">{c.label}</div>
            <div className="mt-3 flex items-end justify-center rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <CharacterSprite identity={c.key} pose="idle" scale={4} alt={`${c.label} idle animation`} />
            </div>
            <div className="mt-3 divide-y divide-white/5 border-t border-white/10">
              <SpecRow label="Sheet" value="192×48 RGBA (4 frames)" />
              <SpecRow label="Frame" value="48×48" />
              <SpecRow label="Playback" value={`${spec.fps} fps · 0.5s loop (CSS steps)`} />
              <SpecRow label="Reduced motion" value="frozen on frame 0 (= idle.png)" />
            </div>
          </div>
        ))}
      </div>
      <p className="rounded-lg border border-dashed border-white/15 p-2.5 text-center text-[10px] leading-relaxed text-muted-foreground">
        If the characters aren’t moving, your device has reduced motion enabled — they correctly freeze on frame 0.
      </p>
    </div>
  );
}