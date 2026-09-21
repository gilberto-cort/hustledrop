// Deterministic display translations for match results. No AI-generated explanations.

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