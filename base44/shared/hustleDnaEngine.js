// Deterministic HustleDNA engine — server-side shared module.
// Pure functions. NO generative AI, no network calls, no side effects.
// HustleDNA describes how a user's stated preferences suggest they may prefer
// to build and operate a business. It is NOT a psychological test, clinical
// assessment, intelligence test or prediction of entrepreneurial success.
// FAIRNESS RULE: gender, avatar presentation, age, race, ethnicity and religion
// are NEVER inputs. Only entrepreneurial work-style answers are used.

const BASE_SCORE = 20;

export const TYPE_CODES = {
  hustler: 'HU',
  digital_builder: 'DB',
  creator: 'CR',
  connector: 'CN',
  operator: 'OP',
  builder: 'BU',
};

const TYPE_ORDER = ['hustler', 'digital_builder', 'creator', 'connector', 'operator', 'builder'];

// Deterministic signal tables: points each profile answer contributes per archetype.
// These are signals, not rigid stereotypes — a user can score highly in
// seemingly different archetypes.
const SIGNALS = {
  hustler: {
    speed_preference: { asap: 14, '1_2_weeks': 9, within_30_days: 5 },
    primary_priority: { speed: 12 },
    sales_comfort: { '2': 2, '3': 6, '4': 10 },
    income_goal: { '1000_2500': 2, '2500_5000': 4, '5000_plus': 6 },
    weekly_hours: { '11_20': 2, '20_plus': 4 },
    skills: { sales: 8, social_media: 5, people: 4 },
    interests: { business: 5, ecommerce: 4, social_media: 3 },
  },
  digital_builder: {
    skills: { technology: 12, ai: 12, gaming: 4 },
    primary_priority: { automation: 12, scale: 4 },
    work_location_preference: { online: 10 },
    business_model_preference: { digital: 8, content: 4 },
    interests: { technology: 6, ai: 6, gaming: 4, ecommerce: 3 },
    assets: { computer: 4 },
  },
  creator: {
    skills: { design: 10, video: 10, photography: 10, writing: 8, social_media: 6, gaming: 3, cooking: 3, beauty: 3 },
    business_model_preference: { content: 10, product: 6, digital: 4 },
    interests: { art: 6, music: 6, media: 6, fashion: 4, social_media: 4, gaming: 3, beauty: 3 },
    primary_priority: { enjoyment: 8 },
    assets: { camera: 5, audience_following: 5 },
  },
  connector: {
    customer_interaction_preference: { indifferent: 3, some: 7, high: 14 },
    sales_comfort: { '3': 6, '4': 10 },
    skills: { teaching: 10, people: 10, sales: 8, social_media: 4 },
    interests: { education: 5, events: 4, business: 4, children: 3, pets: 2 },
    business_model_preference: { service: 5 },
    primary_priority: { scale: 4 },
  },
  operator: {
    skills: { organization: 18, events: 6, writing: 4 },
    weekly_hours: { '11_20': 6, '20_plus': 10 },
    speed_preference: { within_30_days: 4, longer_build: 10 },
    business_model_preference: { service: 8, rental: 5 },
    interests: { home: 4, education: 3 },
    primary_priority: { cost: 4, flexibility: 3 },
  },
  builder: {
    physical_work_tolerance: { '2': 4, '3': 9, '4': 14 },
    skills: { repairs: 10, automotive: 10, landscaping: 10, cleaning: 8, cooking: 5, fitness: 5, events: 3 },
    assets: { tools: 8, specialized_equipment: 6, vehicle: 4, workspace: 3 },
    work_location_preference: { local_in_person: 10 },
    interests: { automotive: 5, home: 5, outdoors: 5, food: 3, fitness: 3 },
    speed_preference: { asap: 4 },
    primary_priority: { speed: 4 },
  },
};

// Per-field caps keep any single signal category from dominating an archetype.
const CAPS = {
  hustler: { skills: 14, interests: 10 },
  digital_builder: { skills: 28, interests: 15, assets: 6 },
  creator: { skills: 24, interests: 15, assets: 10 },
  connector: { skills: 22, interests: 15 },
  operator: { skills: 26, interests: 7 },
  builder: { skills: 24, assets: 12, interests: 12 },
};

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function scoreArchetype(type, profile) {
  const signals = SIGNALS[type];
  const caps = CAPS[type] || {};
  const contributions = [{ key: 'base', points: BASE_SCORE }];
  let raw = BASE_SCORE;
  for (const field of Object.keys(signals)) {
    const table = signals[field];
    const value = profile[field];
    const matched = [];
    if (Array.isArray(value)) {
      for (const v of value) {
        if (table[String(v)]) matched.push({ key: field + ':' + v, points: table[String(v)] });
      }
    } else if (value !== undefined && value !== null) {
      const p = table[String(value)];
      if (p) matched.push({ key: field + ':' + value, points: p });
    }
    matched.sort((a, b) => b.points - a.points);
    const cap = caps[field] !== undefined ? caps[field] : Infinity;
    let used = 0;
    for (const m of matched) {
      if (used + m.points <= cap) { contributions.push(m); used += m.points; }
    }
    raw += used;
  }
  return { raw, score: Math.round(clamp(raw, 0, 100)), contributions };
}

// ---------- Six preference dimensions (0 = left pole, 100 = right pole) ----------

function dimension(base, adjustments) {
  const factors = [];
  let value = base;
  for (const [condition, delta, label] of adjustments) {
    if (condition) { value += delta; factors.push(label + (delta > 0 ? ' +' + delta : ' ' + delta)); }
  }
  return { value: Math.round(clamp(value, 0, 100)), factors };
}

function computeDimensions(profile) {
  const skills = profile.skills || [];
  const has = (s) => skills.includes(s);
  const details = [];

  // REVENUE TEMPO — Quick Start ↔ Long Build
  const SPEED_BASE = { asap: 15, '1_2_weeks': 30, within_30_days: 45, longer_build: 80 };
  details.push({
    key: 'revenue_tempo',
    ...dimension(SPEED_BASE[profile.speed_preference] ?? 45, [
      [profile.primary_priority === 'speed', -5, 'priority:speed'],
      [profile.primary_priority === 'automation', 8, 'priority:automation'],
      [profile.primary_priority === 'scale', 10, 'priority:scale'],
      [profile.weekly_hours === 'lt_5', 8, 'hours:lt_5'],
    ]),
  });

  // WORK MODE — Hands-On ↔ Digital
  const LOC_BASE = { online: 85, local_in_person: 20, either: 50 };
  details.push({
    key: 'work_mode',
    ...dimension(LOC_BASE[profile.work_location_preference] ?? 50, [
      [profile.physical_work_tolerance === 1, 8, 'tolerance:none'],
      [profile.physical_work_tolerance === 3, -4, 'tolerance:moderate'],
      [profile.physical_work_tolerance === 4, -8, 'tolerance:heavy'],
      [has('technology') || has('ai'), 5, 'skill:tech'],
      [has('repairs') || has('automotive') || has('landscaping') || has('cleaning'), -5, 'skill:hands_on'],
      [(profile.assets || []).includes('computer'), 3, 'asset:computer'],
    ]),
  });

  // SOCIAL ENERGY — Independent ↔ People-Driven
  const INTER_BASE = { minimal: 15, indifferent: 40, some: 60, high: 90 };
  details.push({
    key: 'social_energy',
    ...dimension(INTER_BASE[profile.customer_interaction_preference] ?? 50, [
      [profile.sales_comfort === 4, 8, 'sales_comfort:4'],
      [profile.sales_comfort === 3, 4, 'sales_comfort:3'],
      [profile.sales_comfort === 1, -5, 'sales_comfort:1'],
      [has('people'), 6, 'skill:people'],
      [has('teaching'), 6, 'skill:teaching'],
      [has('sales'), 4, 'skill:sales'],
    ]),
  });

  // GROWTH STYLE — Craft ↔ Systems
  details.push({
    key: 'growth_style',
    ...dimension(50, [
      [profile.primary_priority === 'automation', 20, 'priority:automation'],
      [profile.primary_priority === 'scale', 15, 'priority:scale'],
      [profile.primary_priority === 'enjoyment', -8, 'priority:enjoyment'],
      [profile.primary_priority === 'speed', -5, 'priority:speed'],
      [profile.primary_priority === 'flexibility', -5, 'priority:flexibility'],
      [has('technology') || has('ai'), 10, 'skill:tech'],
      [has('organization'), 12, 'skill:organization'],
      [has('design') || has('photography'), -5, 'skill:creative_craft'],
    ]),
  });

  // SELLING STYLE — Attraction ↔ Outreach
  const SALES_BASE = { 1: 15, 2: 35, 3: 65, 4: 90 };
  details.push({
    key: 'selling_style',
    ...dimension(SALES_BASE[profile.sales_comfort] ?? 50, [
      [profile.customer_interaction_preference === 'high', 5, 'interaction:high'],
      [profile.customer_interaction_preference === 'minimal', -5, 'interaction:minimal'],
      [has('sales'), 8, 'skill:sales'],
      [profile.primary_priority === 'speed', 5, 'priority:speed'],
    ]),
  });

  // RISK APPROACH — Test First ↔ Invest First
  const BUDGET_BASE = { '0_50': 12, '51_250': 28, '251_500': 42, '501_1000': 58, '1001_plus': 78 };
  details.push({
    key: 'risk_approach',
    ...dimension(BUDGET_BASE[profile.startup_budget] ?? 42, [
      [profile.speed_preference === 'asap', 6, 'speed:asap'],
      [profile.speed_preference === 'longer_build', -8, 'speed:longer_build'],
      [profile.primary_priority === 'cost', -8, 'priority:cost'],
    ]),
  });

  const dimensions = {};
  for (const d of details) dimensions[d.key] = d.value;
  return { dimensions, details };
}

// ---------- Strengths & traps (assigned only when supported by answers) ----------

const SIGNATURE_STRENGTHS = {
  hustler: 'fast_mover',
  digital_builder: 'systems_thinker',
  creator: 'creative_differentiator',
  connector: 'relationship_builder',
  operator: 'organized_executor',
  builder: 'practical_executor',
};

const SIGNATURE_TRAPS = {
  hustler: 'shiny_object',
  digital_builder: 'overbuilding',
  creator: 'perfection_loop',
  connector: 'customer_dependence',
  operator: 'planning_loop',
  builder: 'solo_bottleneck',
};

function deriveStrengths(scores, dimensions, profile, primaryType) {
  const skills = profile.skills || [];
  const cands = [];
  const add = (token, support) => cands.push({ token, support });
  if (scores.digital_builder >= 60 && (profile.primary_priority === 'automation' || skills.includes('organization'))) add('systems_thinker', scores.digital_builder);
  if (scores.hustler >= 60 && dimensions.revenue_tempo <= 40) add('fast_mover', scores.hustler);
  if (scores.connector >= 60) add('relationship_builder', scores.connector);
  if (scores.creator >= 60) add('creative_differentiator', scores.creator);
  if (scores.operator >= 60) add('organized_executor', scores.operator);
  if (scores.builder >= 60) add('practical_executor', scores.builder);
  if (dimensions.social_energy <= 40) add('independent_worker', 100 - dimensions.social_energy);
  if (scores.digital_builder >= 50 && (skills.includes('technology') || skills.includes('ai'))) add('technology_adopter', scores.digital_builder - 10);
  if (scores.connector >= 50 || (profile.sales_comfort >= 3 && ['some', 'high'].includes(profile.customer_interaction_preference))) add('communicator', scores.connector || 50);
  if (scores.builder >= 50 && scores.digital_builder >= 45) add('problem_solver', (scores.builder + scores.digital_builder) / 2);
  if (dimensions.revenue_tempo <= 15) add('fast_mover', 55);
  if (skills.includes('organization')) add('organized_executor', scores.operator >= 50 ? scores.operator : 45);
  if ((profile.assets || []).includes('computer') && skills.includes('social_media')) add('technology_adopter', 40);
  cands.sort((a, b) => b.support - a.support);

  const picked = [SIGNATURE_STRENGTHS[primaryType]];
  for (const c of cands) {
    if (picked.length >= 5) break;
    if (!picked.includes(c.token)) picked.push(c.token);
  }
  return picked;
}

function deriveTraps(scores, dimensions, profile, primaryType) {
  const t = [SIGNATURE_TRAPS[primaryType]]; // supported by the user's strongest alignment
  const push = (token) => { if (!t.includes(token)) t.push(token); };
  if (profile.sales_comfort === 1) push('sales_avoidance');
  if (scores.hustler >= 60 && dimensions.revenue_tempo <= 35) push('shiny_object');
  if (scores.digital_builder >= 60 && dimensions.growth_style >= 70) push('overbuilding');
  if (scores.creator >= 60 && dimensions.revenue_tempo >= 55) push('perfection_loop');
  if (scores.creator >= 55 && profile.sales_comfort <= 2) push('underpricing');
  if (dimensions.social_energy <= 35 && scores.builder >= 55) push('solo_bottleneck');
  if (dimensions.risk_approach >= 70 && dimensions.revenue_tempo <= 40) push('overinvesting');
  if (scores.operator >= 60 && dimensions.revenue_tempo >= 60) push('planning_loop');
  if (scores.connector >= 60 && dimensions.social_energy >= 75) push('customer_dependence');
  return t.slice(0, 3);
}

// ---------- Entry point ----------

export function computeDna(profile) {
  const contributions = {};
  const scores = {};
  for (const type of TYPE_ORDER) {
    const result = scoreArchetype(type, profile);
    scores[type] = result.score;
    contributions[type] = result.contributions;
  }

  const ranked = TYPE_ORDER
    .map((type) => ({ type, score: scores[type] }))
    .sort((a, b) => b.score - a.score || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type));

  const primary_type = ranked[0].type;
  const secondary_type = ranked[1].type;
  const supporting_type = ranked[2].type;
  const hustle_code = TYPE_CODES[primary_type] + '-' + TYPE_CODES[secondary_type];

  const { dimensions, details } = computeDimensions(profile);

  return {
    scores,
    primary_type,
    secondary_type,
    supporting_type,
    hustle_code,
    dimensions,
    dimension_details: details,
    strengths: deriveStrengths(scores, dimensions, profile, primary_type),
    traps: deriveTraps(scores, dimensions, profile, primary_type),
    contributions,
  };
}