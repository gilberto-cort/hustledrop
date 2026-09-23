// ============================================================
// NEON HUSTLE — CHARACTER ASSET MANIFEST (single source of truth)
//
// 12 fixed identities: {dna_type}_{male|female} for Hustler, Digital Builder,
// Creator, Connector, Operator and Builder. Each identity has exactly seven
// poses: portrait, idle, walk_up, walk_down, walk_left, walk_right, victory.
//
// ASSETS ARE NOT YET UPLOADED. Until they are:
//   1. Leave MANIFEST_ACTIVE = false — every surface keeps using the current
//      Avatar-record artwork exactly as today (zero visual change).
//   2. Upload the real files to public/assets/characters/<identity>/<pose>.png
//      (or host them on a stable CDN and change BASE below).
//   3. Flip MANIFEST_ACTIVE to true — the whole app switches over at once,
//      with the current artwork still available as the per-record fallback.
// Never point entries at temporary AI-generation URLs.
// ============================================================

export const DNA_IDENTITY_TYPES = ['hustler', 'digital_builder', 'creator', 'connector', 'operator', 'builder'];

// The app stores presentation as 'masculine' / 'feminine' (Avatar records);
// the asset library names the variants male / female.
export const PRESENTATION_KEYS = { masculine: 'male', feminine: 'female' };

export const POSES = ['portrait', 'idle', 'walk_up', 'walk_down', 'walk_left', 'walk_right', 'victory'];

// Source frame sizes the artwork must be authored at (see the asset spec in
// the project docs/report). Integer display scale multiplies these, so
// pixels never blur.
export const SPRITE_FRAME = 48;   // idle / walk_* / victory
export const PORTRAIT_FRAME = 96; // portrait

const BASE = '/assets/characters';

export const MANIFEST_ACTIVE = false; // flip to true ONLY after real assets are uploaded

export const ALL_IDENTITIES = DNA_IDENTITY_TYPES.flatMap((t) => ['male', 'female'].map((p) => `${t}_${p}`));

// Stable identity key from an Avatar record (dna_type + presentation).
// Returns null for unknown DNA types — never guesses an identity.
export function identityKey(dnaType, presentation) {
  if (!DNA_IDENTITY_TYPES.includes(dnaType)) return null;
  return `${dnaType}_${PRESENTATION_KEYS[presentation] || 'male'}`;
}

export function identityFromAvatar(avatar) {
  return avatar ? identityKey(avatar.dna_type, avatar.presentation) : null;
}

export function assetPath(identity, pose) {
  return `${BASE}/${identity}/${pose}.png`;
}

// Resolves a library asset, or null while the manifest is inactive / the
// slot is unknown — callers fall back to the Avatar record's own artwork.
export function getCharacterAsset(identity, pose = 'idle') {
  if (!MANIFEST_ACTIVE || !identity || !POSES.includes(pose)) return null;
  return assetPath(identity, pose);
}

// ============================================================
// ANIMATED SPRITE SHEETS — one horizontal strip per animation.
// Flag-gated exactly like the static library: keep false until the real
// sheets are uploaded. Every sheet is backed by its static pose fallback.
// ============================================================

export const MANIFEST_ANIMATIONS_ACTIVE = false; // flip to true ONLY after all sheets are uploaded

// Frame counts and playback speed per animation. All frames are SPRITE_FRAME
// (48x48), laid out left-to-right, contiguous. The app enforces the fps —
// sheets carry no timing metadata. Frame 0 must match the static pose file,
// and the last frame must loop seamlessly back into frame 0.
export const ANIMATIONS = {
  idle: { frames: 4, fps: 6 },
  walk_up: { frames: 4, fps: 8 },
  walk_down: { frames: 4, fps: 8 },
  walk_left: { frames: 4, fps: 8 },
  walk_right: { frames: 4, fps: 8 },
  victory: { frames: 6, fps: 10 },
};

export function animationSheetPath(identity, pose) {
  return `${BASE}/${identity}/${pose}.sheet.png`;
}

// Resolves an animation, or null — callers fall back to the static pose.
export function getCharacterAnimation(identity, pose = 'idle') {
  const spec = ANIMATIONS[pose];
  if (!MANIFEST_ANIMATIONS_ACTIVE || !identity || !spec) return null;
  return { url: animationSheetPath(identity, pose), ...spec };
}