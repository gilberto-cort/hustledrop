// Deterministic HustleMatch matching engine.
// Pure functions — NO generative AI, no network calls, no side effects.
// Personal Fit measures COMPATIBILITY with a user's stated circumstances.
// It is NOT a prediction of success, income or profitability.

const BUDGET_MAX = { '0_50': 50, '51_250': 250, '251_500': 500, '501_1000': 1000, '1001_plus': 5000 };
const HOURS_MAP = { 'lt_5': 4, '5_10': 10, '11_20': 20, '20_plus': 35 };
const SPEED_MAP = { 'asap': 5, '1_2_weeks': 4, 'within_30_days': 3, 'longer_build': 2 };
const SALES_CAPACITY = { 1: 1, 2: 3, 3: 4, 4: 5 };
const INTERACTION_CAPACITY = { minimal: 1, some: 3, indifferent: 3, high: 5 };

// How each BusinessModel family maps to the user's business-model preference tokens
const FAMILY_PREF = {
  'Digital Services': ['digital', 'service'],
  'Creative': ['content', 'digital'],
  'Knowledge': ['content', 'service'],
  'Content': ['content', 'digital'],
  'Local Services': ['service'],
  'Home Services': ['service'],
  'Events': ['service'],
  'Rental': ['rental'],
  'Products': ['product', 'digital'],
};

// Assets that can substitute for each other for hard-requirement checks
const ASSET_SUBSTITUTES = { camera_or_smartphone: ['camera', 'smartphone'] };

export const FACTOR_WEIGHTS = {
  budget: 0.18,
  skills: 0.12,
  time: 0.12,
  location: 0.10,
  sales: 0.08,
  interaction: 0.08,
  physical: 0.06,
  preference: 0.08,
  objective: 0.06,
  interests: 0.04,
  speed: 0.08,
};

function clampFit(x) {
  return Math.max(1, Math.min(99, x));
}

function num(v, d = 1) {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

// ---------- Factor scores (0.00 – 1.00) ----------

function budgetFit(budgetKey, m) {
  const max = BUDGET_MAX[budgetKey] ?? 500;
  const r = (m.startup_min || 0) / max;
  if (r <= 0.6) return 1.0; // comfortably below budget — having more money than needed is never a negative
  if (r <= 0.8) return 1.0 - ((r - 0.6) / 0.2) * 0.15; // ~80% → 0.85
  if (r <= 1.0) return 0.85 - ((r - 0.8) / 0.2) * 0.15; // ~100% → 0.70
  return Math.max(0, 0.7 - ((r - 1.0) / 0.25) * 0.35); // 101–125% → ~0.35
}

function skillFit(userSkills, m) {
  const user = userSkills || [];
  const primary = m.primary_skills || [];
  const secondary = m.secondary_skills || [];
  if (user.length === 0) return 0.35;
  if (primary.length === 0 && secondary.length === 0) return 0.6;
  const pMatch = primary.filter((s) => user.includes(s)).length;
  const sMatch = secondary.filter((s) => user.includes(s)).length;
  let score = 0;
  if (primary.length) score += 0.6 * Math.min(1, pMatch / Math.min(2, primary.length));
  if (secondary.length) score += 0.4 * Math.min(1, sMatch / Math.min(2, secondary.length));
  if (!primary.length) score = Math.min(1, sMatch / Math.min(2, secondary.length));
  if (m.beginner_friendly) score = Math.max(score, 0.45);
  return Math.max(0.1, score);
}

function timeFit(hoursKey, m) {
  const avail = HOURS_MAP[hoursKey] ?? 10;
  const need = m.minimum_hours_week || 0;
  if (need === 0) return 1;
  const r = need / avail;
  if (r <= 0.5) return 1;
  if (r <= 1.0) return 1 - 0.6 * ((r - 0.5) / 0.5);
  return Math.max(0.05, 0.4 - 0.3 * ((r - 1) / 0.5));
}

function locationFit(pref, m) {
  const on = num(m.online_score), lo = num(m.local_score);
  if (pref === 'online') return on / 5;
  if (pref === 'local_in_person') return lo / 5;
  return Math.max(on, lo) / 5; // EITHER never gets a penalty
}

function salesFit(comfort, m) {
  const cap = SALES_CAPACITY[num(comfort, 3)] ?? 3;
  return 1 - Math.abs(num(m.sales_intensity) - cap) / 4;
}

function interactionFit(pref, m) {
  const cap = INTERACTION_CAPACITY[pref] ?? 3;
  return 1 - Math.abs(num(m.customer_interaction) - cap) / 4;
}

function physicalFromTolerance(tol, m) {
  const need = num(m.physical_intensity);
  if (need <= tol) return 1.0; // tolerance is willingness, not preference — no bonus for liking it
  if (need === tol + 1) return 0.5;
  return 0;
}

function preferenceFit(pref, m) {
  if (!pref || pref === 'no_preference') return 0.75; // neutral
  const prefs = FAMILY_PREF[m.family] || [];
  if (prefs[0] === pref) return 1.0;
  if (prefs[1] === pref) return 0.7;
  return 0.45;
}

function interestFit(interests, m) {
  const user = interests || [];
  if (user.length === 0) return 0.5;
  const tags = m.interest_tags || [];
  const matches = tags.filter((t) => user.includes(t)).length;
  if (matches === 0) return 0.35;
  return Math.min(1, 0.6 + 0.2 * matches); // 1 match → 0.80, 2+ → 1.00
}

function objectiveFit(priority, m, interestScore) {
  switch (priority) {
    case 'speed': return num(m.speed_to_first_sale) / 5;
    case 'cost': return 1 - Math.min(1, (m.startup_min || 0) / 1000);
    case 'flexibility': return Math.min(1, (m.solo_friendly ? 0.5 : 0.15) + (m.weekend_friendly ? 0.5 : 0.15));
    case 'automation': return num(m.automation_potential) / 5;
    case 'scale': return num(m.scalability) / 5;
    case 'enjoyment': return 0.5 + 0.5 * interestScore;
    default: return 0.75;
  }
}

function speedFit(speedKey, m) {
  const want = SPEED_MAP[speedKey] ?? 3;
  return 1 - Math.abs(num(m.speed_to_first_sale) - want) / 4;
}

// ---------- Hard eligibility filters ----------

export function checkEligibility(profile, m) {
  const reasons = [];
  const budgetMax = BUDGET_MAX[profile.startup_budget] ?? 500;

  // 1. Startup cost beyond 125% of budget (unless an admin-approved low-cost validation pathway exists)
  if ((m.startup_min || 0) > budgetMax * 1.25 && !m.low_cost_validation_pathway) {
    reasons.push('budget_exceeded');
  }

  const assets = profile.assets || [];

  // 2. Vehicle required but not available
  if (m.vehicle_required && !assets.includes('vehicle')) reasons.push('vehicle_required');

  // 3. Genuinely required asset absent with no practical substitute
  for (const req of m.hard_requirements || []) {
    const ok = (ASSET_SUBSTITUTES[req] || [req]).some((a) => assets.includes(a));
    if (!ok) reasons.push('required_asset_missing_' + req);
  }

  // 4. Physical requirement exceeds stated tolerance by more than one level
  const tol = num(profile.physical_work_tolerance, 1);
  if (num(m.physical_intensity) > tol + 1) reasons.push('physical_tolerance_exceeded');

  // 5. Known required credential the user does not possess
  // (No seed models declare one yet; the hook stays for future models.)
  if (m.required_credential && !(profile.credentials || []).includes(m.required_credential)) {
    reasons.push('credential_required');
  }

  // 6. Weekly hour requirement exceeds 150% of availability
  const avail = HOURS_MAP[profile.weekly_hours] ?? 10;
  if ((m.minimum_hours_week || 0) > avail * 1.5) reasons.push('time_requirement_exceeded');

  return reasons;
}

// ---------- Penalties & bonuses ----------

function collectPenalties(profile, m) {
  const p = [];
  const salesComfort = num(profile.sales_comfort, 3);
  if (salesComfort === 1 && num(m.sales_intensity) === 5) p.push({ key: 'high_sales_pressure', points: 12 });
  if (profile.customer_interaction_preference === 'minimal' && num(m.customer_interaction) === 5) p.push({ key: 'high_interaction', points: 10 });

  const wantsOnline = profile.work_location_preference === 'online';
  const wantsLocal = profile.work_location_preference === 'local_in_person';
  if (wantsOnline && num(m.local_score) >= 4 && num(m.online_score) <= 2) p.push({ key: 'local_only_model', points: 12 });
  if (wantsLocal && num(m.online_score) >= 5 && num(m.local_score) <= 2) p.push({ key: 'purely_online_model', points: 7 });

  const isBeginner = (profile.skills || []).length <= 1;
  if (isBeginner && num(m.regulatory_complexity) === 5) p.push({ key: 'regulatory_heavy_for_beginner', points: 8 });

  const wantsFast = (SPEED_MAP[profile.speed_preference] ?? 3) >= 4;
  if (wantsFast && num(m.regulatory_complexity) >= 4) p.push({ key: 'regulatory_slows_launch', points: 8 });

  if (profile.weekly_hours === 'lt_5' && (m.minimum_hours_week || 0) >= 10) p.push({ key: 'time_heavy_model', points: 10 });

  if (profile.primary_priority === 'automation' && num(m.automation_potential) <= 2) p.push({ key: 'low_automation_conflict', points: 8 });
  if (profile.primary_priority === 'speed' && num(m.speed_to_first_sale) <= 2) p.push({ key: 'slow_launch_conflict', points: 10 });

  return p;
}

function collectBonuses(profile, m) {
  const b = [];
  const VALUABLE = ['vehicle', 'camera', 'specialized_equipment', 'tools', 'workspace', 'audience_following'];
  const assets = profile.assets || [];
  const reqMatch = (m.required_assets || []).filter((a) => VALUABLE.includes(a) && assets.includes(a)).length;
  if (reqMatch > 0) b.push({ key: 'existing_assets', points: Math.min(3, 1.5 * reqMatch) });

  const userSkills = profile.skills || [];
  const pMatch = (m.primary_skills || []).filter((s) => userSkills.includes(s)).length;
  if (pMatch >= 2) b.push({ key: 'strong_skill_alignment', points: 3 });
  else if (pMatch === 1) b.push({ key: 'skill_alignment', points: 1.5 });

  // Bonuses can never rescue an ineligible business and never exceed +6 combined
  let total = b.reduce((s, x) => s + x.points, 0);
  if (total > 6) {
    const scale = 6 / total;
    b.forEach((x) => { x.points = Math.round(x.points * scale * 10) / 10; });
    total = 6;
  }
  return b;
}

// ---------- Scoring ----------

function recomputeFinal(factors, penalties, bonuses) {
  let base = 0;
  for (const k of Object.keys(FACTOR_WEIGHTS)) base += FACTOR_WEIGHTS[k] * (factors[k] ?? 0);
  const penaltyTotal = (penalties || []).reduce((s, p) => s + p.points, 0);
  const bonusTotal = (bonuses || []).reduce((s, p) => s + p.points, 0);
  return clampFit(base * 100 - penaltyTotal + bonusTotal);
}

export function scoreModel(profile, m) {
  const factors = {
    budget: budgetFit(profile.startup_budget, m),
    skills: skillFit(profile.skills, m),
    time: timeFit(profile.weekly_hours, m),
    location: locationFit(profile.work_location_preference, m),
    sales: salesFit(profile.sales_comfort, m),
    interaction: interactionFit(profile.customer_interaction_preference, m),
    physical: physicalFromTolerance(num(profile.physical_work_tolerance, 1), m),
    preference: preferenceFit(profile.business_model_preference, m),
    interests: interestFit(profile.interests, m),
  };
  factors.objective = objectiveFit(profile.primary_priority, m, factors.interests);
  factors.speed = speedFit(profile.speed_preference, m);

  const penalties = collectPenalties(profile, m);
  const bonuses = collectBonuses(profile, m);
  const fit = recomputeFinal(factors, penalties, bonuses);

  // Deterministic explainability — no AI invents reasons
  const positives = [];
  const negatives = [];
  if (factors.budget >= 0.85) positives.push('budget_fit');
  if ((m.startup_min || 0) === 0) positives.push('low_startup_cost');
  const userSkills = profile.skills || [];
  if ((m.primary_skills || []).some((s) => userSkills.includes(s))) positives.push('skill_alignment');
  if (m.weekend_friendly) positives.push('weekend_fit');
  if (num(m.automation_potential) >= 4) positives.push('automation_fit');
  if (num(m.speed_to_first_sale) >= 4) positives.push('fast_launch_fit');
  if (m.vehicle_required && (profile.assets || []).includes('vehicle')) positives.push('existing_vehicle');
  if (factors.interaction >= 0.9) positives.push('low_customer_interaction_fit');
  (m.interest_tags || []).filter((t) => (profile.interests || []).includes(t)).slice(0, 2)
    .forEach((t) => positives.push(t + '_interest'));

  if (num(m.physical_intensity) >= 4) negatives.push('physical_setup');
  if (num(m.sales_intensity) >= 4) negatives.push('sales_intensity');
  if (num(m.automation_potential) <= 2) negatives.push('low_automation');
  if ((m.startup_min || 0) >= 300) negatives.push('equipment_cost');
  if (num(m.speed_to_first_sale) <= 2) negatives.push('slow_validation');
  if ((m.friction_reasons || []).includes('weekend_work')) negatives.push('weekend_dependency');
  if ((m.friction_reasons || []).includes('weather_dependency')) negatives.push('weather_dependency');

  return {
    model: m,
    factors,
    baseScore: Math.round(Object.keys(FACTOR_WEIGHTS).reduce((s, k) => s + FACTOR_WEIGHTS[k] * factors[k], 0) * 1000) / 10,
    penalties,
    bonuses,
    fit,
    fitDisplay: Math.round(fit),
    positives,
    negatives,
    rank: null,
  };
}

export function computeMatches(profile, models) {
  const eligible = [];
  const filtered = [];
  for (const m of (models || []).filter((x) => x.active !== false)) {
    const reasons = checkEligibility(profile, m);
    if (reasons.length > 0) {
      filtered.push({ model: m, reasons });
      continue;
    }
    eligible.push(scoreModel(profile, m));
  }
  // Stable deterministic ordering: fit desc, then name asc
  eligible.sort((a, b) => (b.fit - a.fit) || a.model.name.localeCompare(b.model.name));
  eligible.forEach((r, i) => { r.rank = i + 1; });
  return { eligible, filtered, confidence: computeConfidence(profile) };
}

// ---------- Match Confidence (information quality, not accuracy of prediction) ----------

export function computeConfidence(profile) {
  let score = 100;
  if ((profile.skills || []).length === 0) score -= 10;
  if (!profile.business_model_preference || profile.business_model_preference === 'no_preference') score -= 5;
  if (!profile.work_location_preference || profile.work_location_preference === 'either') score -= 5;
  const interests = profile.interests || [];
  if (interests.length === 0 || interests.length >= 8) score -= 5;
  if (num(profile.sales_comfort, 3) >= 4 && profile.customer_interaction_preference === 'minimal') score -= 10;
  else if (num(profile.physical_work_tolerance, 1) >= 4 && profile.work_location_preference === 'online') score -= 10;
  score = Math.max(40, score);
  const category = score >= 85 ? 'HIGH' : score >= 65 ? 'GOOD' : 'LIMITED';
  return { score, category };
}

// ---------- Tie detection & tie-breaker ----------

const TIE_POINT_GAP = 3;

export function findTieBreaker(m1, m2) {
  if (!m1 || !m2 || Math.abs(m1.fit - m2.fit) > TIE_POINT_GAP) return null;
  const a = m1.model, b = m2.model;

  if (Math.abs(num(a.physical_intensity) - num(b.physical_intensity)) >= 2) {
    const heavy = num(a.physical_intensity) > num(b.physical_intensity) ? a : b;
    const light = heavy === a ? b : a;
    return {
      key: 'physical',
      question: 'We found two very close matches. Which sounds less annoying to you?',
      options: [
        { modelId: light.id, text: `Mostly seated, screen-based work (${light.name})` },
        { modelId: heavy.id, text: `Hands-on, physical work (${heavy.name})` },
      ],
    };
  }
  if (Math.abs(num(a.customer_interaction) - num(b.customer_interaction)) >= 2) {
    const social = num(a.customer_interaction) > num(b.customer_interaction) ? a : b;
    const quiet = social === a ? b : a;
    return {
      key: 'interaction',
      question: 'Which sounds better day to day?',
      options: [
        { modelId: social.id, text: `Regular conversations with customers (${social.name})` },
        { modelId: quiet.id, text: `Working mostly on your own (${quiet.name})` },
      ],
    };
  }
  if ((num(a.speed_to_first_sale) >= 4 && num(b.speed_to_first_sale) <= 2) ||
      (num(b.speed_to_first_sale) >= 4 && num(a.speed_to_first_sale) <= 2)) {
    const fast = num(a.speed_to_first_sale) > num(b.speed_to_first_sale) ? a : b;
    const automated = fast === a ? b : a;
    return {
      key: 'speed',
      question: 'Which matters more to you right now?',
      options: [
        { modelId: fast.id, text: `A faster path to a possible first sale (${fast.name})` },
        { modelId: automated.id, text: `More room to automate over time (${automated.name})` },
      ],
    };
  }
  // No meaningful differentiator — keep deterministic ranking, force nothing
  return null;
}

// Adjust ONLY the affected compatibility dimension, then recalculate the affected finals.
export function applyTieBreaker(m1, m2, dimensionKey, chosenModelId) {
  const chosen = m1.model.id === chosenModelId ? m1.model : m2.model;
  const adjust = (s) => {
    const factors = { ...s.factors };
    if (dimensionKey === 'physical') {
      const tol = Math.min(4, num(chosen.physical_intensity, 1));
      factors.physical = physicalFromTolerance(tol, s.model);
    } else if (dimensionKey === 'interaction') {
      const cap = num(chosen.customer_interaction, 3);
      factors.interaction = 1 - Math.abs(num(s.model.customer_interaction) - cap) / 4;
    } else if (dimensionKey === 'speed') {
      const want = num(chosen.speed_to_first_sale, 3);
      factors.speed = 1 - Math.abs(num(s.model.speed_to_first_sale) - want) / 4;
    }
    return { ...s, factors, fit: recomputeFinal(factors, s.penalties, s.bonuses) };
  };
  return [adjust(m1), adjust(m2)];
}