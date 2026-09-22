// Mission identity for the RPG-style Business Builder. Presentation metadata
// only — matching, scoring, generation and persistence are untouched. XP is
// derived from ACCEPTED module records (one idempotent award per mission by
// construction: re-accepting a new version of the same mission never adds XP).
export const XP_PER_MISSION = 50;
export const MAX_BUILD_XP = 300;

export const MISSION_META = {
  customer: {
    num: '01',
    title: 'FIND YOUR CROWD',
    objective: 'Compare your three candidate crowds, then lock in the first one you\u2019ll test with real people.',
    generate: 'SCOUT MY CROWD',
  },
  offer: {
    num: '02',
    title: 'FORGE YOUR OFFER',
    objective: 'Turn what you sell into a package a real person can say yes to.',
    generate: 'FORGE MY OFFERS',
  },
  pricing: {
    num: '03',
    title: 'SET YOUR PRICE',
    objective: 'Pick a starting price with your own assumptions \u2014 then test it with real customers.',
    generate: 'PRICE MY OFFER',
  },
  brand: {
    num: '04',
    title: 'CREATE YOUR IDENTITY',
    objective: 'Choose a name, then shape how your business shows up.',
    generate: 'GENERATE NAME OPTIONS',
  },
  sales: {
    num: '05',
    title: 'EQUIP YOUR PITCH',
    objective: 'Choose your pitch tone, preview your scripts and practice the conversation.',
    generate: 'FORGE MY PITCH',
  },
  marketing: {
    num: '06',
    title: 'LAUNCH YOUR CAMPAIGN',
    objective: 'Pick your channels and set up your first campaign moves.',
    generate: 'PLAN MY CAMPAIGN',
  },
};

// Cosmetic build-achievement emblems — derived from accepted module records,
// never written separately, so they can never double-unlock.
export const MISSION_ACHIEVEMENTS = {
  customer: 'CROWD LOCKED',
  offer: 'OFFER FORGED',
  pricing: 'PRICE SET',
  brand: 'NAMED',
  sales: 'PITCH ARMED',
  marketing: 'CAMPAIGN READY',
};