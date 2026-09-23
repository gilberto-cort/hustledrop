import { Compass, Backpack, Rocket, Sprout, Crown } from 'lucide-react';

// ============================================================
// NEON HUSTLE — CITY DISTRICT MANIFEST (single source of truth)
//
// Five fixed districts, in journey order. District states are DERIVED from
// existing persisted business/quest records (see deriveDistrictStates) —
// the city adds no parallel progression system and persists nothing itself.
//
// ASSETS ARE NOT YET UPLOADED. Upload isometric tiles to
//   public/assets/city/<district_key>/<state>.png   (locked | available | completed)
// then flip CITY_ASSETS_ACTIVE to true. Until then tiles render their
// district icon. Never point entries at temporary AI-generation URLs.
// ============================================================

export const DISTRICT_STATES = ['locked', 'available', 'completed'];

export const DISTRICTS = [
  {
    key: 'crossroads',
    name: 'CROSSROADS',
    icon: Compass,
    tagline: 'Know yourself, pick a direction.',
    milestone: 'HustleDNA + a selected business',
  },
  {
    key: 'opportunity_alley',
    name: 'OPPORTUNITY ALLEY',
    icon: Backpack,
    tagline: 'Forge the offer.',
    milestone: 'All six Build missions locked in',
  },
  {
    key: 'founders_row',
    name: "FOUNDER'S ROW",
    icon: Rocket,
    tagline: 'Earn your first customer.',
    milestone: 'Launch quest complete',
  },
  {
    key: 'neon_district',
    name: 'NEON DISTRICT',
    icon: Sprout,
    tagline: 'The road to five.',
    milestone: 'Five customers + the operating loop',
  },
  {
    key: 'skyline_heights',
    name: 'SKYLINE HEIGHTS',
    icon: Crown,
    tagline: 'Above the neon.',
    milestone: 'Beyond the current journey',
  },
];

export const CITY_ASSETS_ACTIVE = false; // flip to true ONLY after real tiles are uploaded

const BASE = '/assets/city';

export function districtAssetPath(key, state) {
  return `${BASE}/${key}/${state}.png`;
}

export function getDistrictAsset(key, state) {
  if (!CITY_ASSETS_ACTIVE) return null;
  if (!DISTRICTS.some((d) => d.key === key)) return null;
  if (!DISTRICT_STATES.includes(state)) return null;
  return districtAssetPath(key, state);
}

// Derives every district's locked/available/completed state from the SAME
// records the pages already load — nothing new is persisted or invented.
// `progress` inputs (all optional booleans):
//   hasDna          — a HustleDNAProfile exists
//   hasSelection    — a SelectedBusiness exists (a business was chosen)
//   buildComplete   — all six Build modules have accepted versions
//   launchComplete  — the LaunchQuest status is 'completed' (first customer)
//   growComplete    — five customers recorded AND the system mission done
export function deriveDistrictStates(progress = {}) {
  const {
    hasDna = false,
    hasSelection = false,
    buildComplete = false,
    launchComplete = false,
    growComplete = false,
  } = progress;
  return {
    crossroads: hasSelection ? 'completed' : hasDna ? 'available' : 'locked',
    opportunity_alley: buildComplete ? 'completed' : hasSelection ? 'available' : 'locked',
    founders_row: launchComplete ? 'completed' : buildComplete ? 'available' : 'locked',
    neon_district: growComplete ? 'completed' : launchComplete ? 'available' : 'locked',
    skyline_heights: growComplete ? 'available' : 'locked',
  };
}