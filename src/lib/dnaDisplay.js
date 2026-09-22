// HustleDNA display metadata and deterministic narrative helpers.
// All copy is template-based — no generative AI. Lower scores are never
// described as weaknesses; they are "less naturally aligned".

export const TYPE_ORDER = ['hustler', 'digital_builder', 'creator', 'connector', 'operator', 'builder'];

export const DNA_TYPES = {
  hustler: {
    code: 'HU', label: 'HUSTLER', accent: 'text-orange-400', bar: 'bg-orange-500',
    chip: 'bg-orange-500/15 border-orange-500/40',
    core: 'Speed, action, outreach and rapid feedback.',
  },
  digital_builder: {
    code: 'DB', label: 'DIGITAL BUILDER', accent: 'text-cyan-300', bar: 'bg-cyan-500',
    chip: 'bg-cyan-500/15 border-cyan-500/40',
    core: 'Technology, automation, leverage and systems.',
  },
  creator: {
    code: 'CR', label: 'CREATOR', accent: 'text-fuchsia-400', bar: 'bg-fuchsia-500',
    chip: 'bg-fuchsia-500/15 border-fuchsia-500/40',
    core: 'Originality, expression, storytelling and creation.',
  },
  connector: {
    code: 'CN', label: 'CONNECTOR', accent: 'text-yellow-400', bar: 'bg-yellow-500',
    chip: 'bg-yellow-500/15 border-yellow-500/40',
    core: 'Relationships, communication, networking and trust.',
  },
  operator: {
    code: 'OP', label: 'OPERATOR', accent: 'text-green-400', bar: 'bg-green-500',
    chip: 'bg-green-500/15 border-green-500/40',
    core: 'Execution, organization, consistency and processes.',
  },
  builder: {
    code: 'BU', label: 'BUILDER', accent: 'text-slate-300', bar: 'bg-slate-400',
    chip: 'bg-slate-400/15 border-slate-400/40',
    core: 'Hands-on execution, practical problem solving, tangible outcomes.',
  },
};

export const DIMENSIONS = [
  { key: 'revenue_tempo', label: 'REVENUE TEMPO', left: 'QUICK START', right: 'LONG BUILD' },
  { key: 'work_mode', label: 'WORK MODE', left: 'HANDS-ON', right: 'DIGITAL' },
  { key: 'social_energy', label: 'SOCIAL ENERGY', left: 'INDEPENDENT', right: 'PEOPLE-DRIVEN' },
  { key: 'growth_style', label: 'GROWTH STYLE', left: 'CRAFT', right: 'SYSTEMS' },
  { key: 'selling_style', label: 'SELLING STYLE', left: 'ATTRACTION', right: 'OUTREACH' },
  { key: 'risk_approach', label: 'RISK APPROACH', left: 'TEST FIRST', right: 'INVEST FIRST' },
];

export const STRENGTHS = {
  systems_thinker: 'Systems Thinker',
  fast_mover: 'Fast Mover',
  relationship_builder: 'Relationship Builder',
  creative_differentiator: 'Creative Differentiator',
  practical_executor: 'Practical Executor',
  independent_worker: 'Independent Worker',
  problem_solver: 'Problem Solver',
  organized_executor: 'Organized Executor',
  technology_adopter: 'Technology Adopter',
  communicator: 'Communicator',
};

// Gamification foundation — levels unlock only through real milestones.
export const AVATAR_LEVELS = {
  1: 'EXPLORER',
  2: 'FOUNDER',
  3: 'LAUNCHER',
  4: 'ENTREPRENEUR',
};

export function levelName(level) {
  return AVATAR_LEVELS[level || 1] || 'EXPLORER';
}

export const TRAPS = {
  shiny_object: 'Shiny Object Syndrome',
  overbuilding: 'Overbuilding',
  perfection_loop: 'Perfection Loop',
  sales_avoidance: 'Sales Avoidance',
  underpricing: 'Underpricing',
  solo_bottleneck: 'Solo Bottleneck',
  overinvesting: 'Overinvesting',
  planning_loop: 'Planning Loop',
  customer_dependence: 'Customer Dependence',
};

const IDENTITY = {
  hustler: 'You tend to move fast. You would rather act, reach out and adjust than plan for months — momentum is how you make progress.',
  digital_builder: 'You tend to build with leverage. Technology, tools and systems are how you prefer to turn effort into something bigger than your own hours.',
  creator: 'You lead with originality. How things look, feel and sound matters to you — you build by making things people actually want to see.',
  connector: 'You tend to build through people. Trust, conversations and relationships are your natural way of creating opportunities.',
  operator: 'You tend to build with order. Consistent execution, clear processes and reliability are how you prefer to operate.',
  builder: 'You tend to build with your hands. Practical problems, tangible work and visible results are where you do your best.',
};

export function identityStatement(dna) {
  const primary = DNA_TYPES[dna.primary_type];
  const secondary = DNA_TYPES[dna.secondary_type];
  const second = secondary ? ` Your ${secondary.label.toLowerCase()} side brings ${secondary.core.toLowerCase()}` : '';
  return IDENTITY[dna.primary_type] + second + '.';
}

export function howYouBuild(dna) {
  const d = dna.dimensions;
  const parts = [];
  parts.push(
    d.work_mode >= 65 ? 'You prefer to work digitally, with tools doing the heavy lifting.'
      : d.work_mode <= 35 ? 'You prefer hands-on work with tangible results.'
      : 'You move comfortably between hands-on and digital work.'
  );
  parts.push(
    d.social_energy >= 65 ? 'You draw energy from working with people.'
      : d.social_energy <= 35 ? 'You prefer to work independently, on your own schedule.'
      : 'You like a balance of solo focus and people time.'
  );
  parts.push(
    d.revenue_tempo <= 40 ? 'You lean toward quick starts — get something live and learn fast.'
      : d.revenue_tempo >= 60 ? 'You are comfortable with a longer build toward something durable.'
      : 'You can move quickly, but a few months of building does not put you off.'
  );
  parts.push(
    d.selling_style >= 65 ? 'When it comes to customers, you are comfortable reaching out directly.'
      : d.selling_style <= 35 ? 'You prefer attracting customers through your work rather than direct outreach.'
      : 'You can sell when needed, though attraction feels a little more natural than outreach.'
  );
  return parts;
}

export function idealEnvironment(dna) {
  const d = dna.dimensions;
  const parts = [];
  parts.push(
    d.work_mode >= 65 ? 'A primarily online environment with good tools.'
      : d.work_mode <= 35 ? 'A local, in-person environment where the work is physical and real.'
      : 'An environment that mixes online tools with in-person work.'
  );
  parts.push(
    d.social_energy >= 65 ? 'Plenty of customer contact and conversations.'
      : d.social_energy <= 35 ? 'Long stretches of focused, independent work with limited interruptions.'
      : 'A mix of customer contact and focused solo time.'
  );
  parts.push(
    d.risk_approach <= 40 ? 'Small, cheap tests before committing money.'
      : d.risk_approach >= 60 ? 'Room to invest up front for a better setup.'
      : 'A modest budget with room for a few paid tools or assets.'
  );
  parts.push(
    d.revenue_tempo <= 40 ? 'Fast feedback loops and short sales cycles.'
      : 'Patience for results that compound over time.'
  );
  return parts;
}