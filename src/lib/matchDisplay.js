// Deterministic display translations for match results. No AI-generated explanations.
import { DNA_TYPES } from '@/lib/dnaDisplay';

export function levelLabel(v) {
  return ['', 'Very low', 'Low', 'Moderate', 'High', 'Very high'][Number(v)] || '—';
}

export function speedLabel(v) {
  return { 5: 'Very fast', 4: 'Fast', 3: 'Moderate', 2: 'Slower build', 1: 'Slow build' }[Number(v)] || '—';
}

export function workModeLabel(m) {
  const on = Number(m.online_score) || 1;
  const lo = Number(m.local_score) || 1;
  if (on >= 4 && lo <= 2) return 'Mostly online';
  if (lo >= 4 && on <= 2) return 'Mostly local';
  return 'Online & local';
}

export function startupRangeLabel(m) {
  return `$${m.startup_min ?? 0}–$${m.startup_max ?? 0}`;
}

const POSITIVE_TEXT = {
  budget_fit: 'Fits comfortably within your stated budget',
  low_startup_cost: 'Can start with essentially no upfront cost',
  skill_alignment: 'Lines up with skills you said you have',
  weekend_fit: 'Works with a weekend-friendly schedule',
  automation_fit: 'Strong potential to automate over time',
  fast_launch_fit: 'Relatively fast path to a first sale',
  existing_vehicle: 'You already have the vehicle it needs',
  low_customer_interaction_fit: 'Matches your preferred level of customer contact',
};

const NEGATIVE_TEXT = {
  physical_setup: 'Involves real physical work',
  sales_intensity: 'Requires proactive, ongoing selling',
  low_automation: 'Mostly hands-on — limited automation',
  equipment_cost: 'Involves some upfront equipment cost',
  slow_validation: 'Takes longer to know whether it is working',
  weekend_dependency: 'Often depends on weekend availability',
  weather_dependency: 'Can be affected by weather',
};

export function positiveText(token) {
  if (POSITIVE_TEXT[token]) return POSITIVE_TEXT[token];
  if (token.endsWith('_interest')) {
    return `Matches your interest in ${token.replace('_interest', '').replace(/_/g, ' ')}`;
  }
  return token.replace(/_/g, ' ');
}

export function negativeText(token) {
  return NEGATIVE_TEXT[token] || token.replace(/_/g, ' ');
}

export const LOCATION_CHECK_NOTE =
  'Some requirements may vary by location and should be verified before launch.';

// Qualitative DNA ↔ business connection. Template-based only — uses the
// user's DNA types, never AI, and never modifies Personal Fit.
const DNA_PRIMARY_CONNECTION = {
  hustler: 'This kind of business rewards your preference for action — you can move first, talk to real people and adjust as you learn instead of planning for months.',
  digital_builder: 'This model leans on tools and systems — the leverage-first way you naturally prefer to build, where the work can compound beyond your own hours.',
  creator: 'This model gives your work room to stand out — the craft itself can attract the right customers instead of a big ad budget.',
  connector: 'This model runs on what you naturally do best: conversations, relationships and trust that can turn into repeat business and referrals.',
  operator: 'This model rewards the consistent, organized execution you prefer — showing up reliably is a genuine advantage here.',
  builder: 'This model gives you tangible, hands-on work with visible results at the end of the day.',
};

const DNA_SECONDARY_CONNECTION = {
  hustler: 'Your Hustler side can appreciate how quickly you can test and adjust here.',
  digital_builder: 'Your Digital Builder side gets room to systematize and automate as things grow.',
  creator: 'Your Creator side can shape how the business looks and feels.',
  connector: 'Your Connector side can build relationships and earn referrals along the way.',
  operator: 'Your Operator side helps keep the day-to-day consistent and organized.',
  builder: 'Your Builder side can appreciate the practical, hands-on nature of the work.',
};

export function dnaConnection(dna) {
  const primary = DNA_TYPES[dna.primary_type];
  const secondary = dna.secondary_type ? DNA_TYPES[dna.secondary_type] : null;
  return {
    header: secondary ? `${primary.label} + ${secondary.label}` : primary.label,
    primary: DNA_PRIMARY_CONNECTION[dna.primary_type] || '',
    secondary: secondary ? DNA_SECONDARY_CONNECTION[dna.secondary_type] || '' : '',
  };
}