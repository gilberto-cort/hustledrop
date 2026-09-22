import { BUILD_MODULES } from '@/lib/builderService';
import { AVATAR_LEVELS } from '@/lib/dnaDisplay';

// THE ONE AUTHORITATIVE PROGRESSION RESOLVER — the Dashboard stage badge, the
// Journey tracker, Next Move, level/XP display, locked navigation hints and
// stage-aware copy ALL consume this single function, so they can never
// contradict each other. Persisted server records only; page-local state never
// decides progression.

// STAGES (what phase of the journey the player is in):
//   DISCOVER — quiz / DNA / matching underway
//   FOUNDER  — business selected; preparing to build / unlock the Builder
//   BUILD    — paid Builder active, business being built
//   LAUNCH   — build requirements complete, First Customer Quest active
//   GROW     — first real customer recorded
export const STAGE_ORDER = ['DISCOVER', 'FOUNDER', 'BUILD', 'LAUNCH', 'GROW'];

// LEVELS (game flavor, separate from stages, never a certification):
//   LV.1 EXPLORER · LV.2 FOUNDER · LV.3 LAUNCHER · LV.4 ENTREPRENEUR · LV.5 OPERATOR
export function levelLabel(level) {
  return AVATAR_LEVELS[level] || AVATAR_LEVELS[1];
}

export function resolveStage(state) {
  const { profileComplete, selected, entitled, acceptedModules = [], quest, firstCustomer } = state;
  if (!profileComplete || !selected) return 'DISCOVER';
  if (!entitled) return 'FOUNDER';
  if (quest) return firstCustomer ? 'GROW' : 'LAUNCH';
  const acceptedSet = new Set(acceptedModules);
  return BUILD_MODULES.every((m) => acceptedSet.has(m.key)) ? 'LAUNCH' : 'BUILD';
}

// Level + XP derive from real records only — a brand-new player is
// LV.1 EXPLORER with 0 XP, never a broken placeholder. No fake XP is awarded.
export function resolveLevel(state) {
  const { quest, selected, firstCustomer } = state;
  if (quest) {
    return {
      level: Number(quest.level) || (firstCustomer ? 4 : 3),
      xp: Number(quest.xp) || 0,
    };
  }
  if (selected) return { level: 2, xp: 0 };
  return { level: 1, xp: 0 };
}

export function resolveJourney(data) {
  const acceptedSet = new Set(data.acceptedModules || []);
  return {
    discover: !!(data.profile && data.profile.profile_complete),
    dna: !!data.dna,
    match: !!data.hasMatch,
    select: !!data.selected,
    build: BUILD_MODULES.every((m) => acceptedSet.has(m.key)),
    launch: !!data.quest,
    grow: (data.customers || 0) > 0,
  };
}

// Stage-aware welcome copy (shown under the greeting).
export const WELCOME = {
  DISCOVER: {
    title: 'FIND THE BUSINESS THAT FITS YOU.',
    body: 'Your answers help HustleDrop narrow the possibilities.',
  },
  FOUNDER: {
    title: 'YOUR HUSTLE HAS BEEN FOUND.',
    body: 'Ready to turn your match into a business?',
  },
  BUILD: {
    title: 'TIME TO BUILD.',
    body: "Turn your idea into something you're ready to launch.",
  },
  LAUNCH: {
    title: 'YOUR BUSINESS IS BUILT. NOW GET IT MOVING.',
    body: 'Complete real-world quests on your way to your first customer.',
  },
  GROW: {
    title: 'YOU GOT THE FIRST CUSTOMER.',
    body: 'Now turn your first win into momentum.',
  },
};

export function resolveProgression(data) {
  const state = {
    profileComplete: !!(data.profile && data.profile.profile_complete),
    hasMatch: !!data.hasMatch,
    selected: !!data.selected,
    entitled: !!data.entitled,
    acceptedModules: data.acceptedModules || [],
    quest: data.quest || null,
    firstCustomer: (data.customers || 0) > 0,
  };
  const { level, xp } = resolveLevel(state);
  return {
    ...state,
    stage: resolveStage(state),
    level,
    levelLabel: levelLabel(level),
    xp,
    journey: resolveJourney(data),
  };
}