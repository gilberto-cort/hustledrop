// Shared temporary-profile form config for the admin Match and DNA testers.
// Used to build a test HustleProfile payload without touching real records.

export const SINGLE_SELECTS = [
  ['startup_budget', 'Startup budget', [['0_50', '$0–$50'], ['51_250', '$51–$250'], ['251_500', '$251–$500'], ['501_1000', '$501–$1,000'], ['1001_plus', '$1,001+']]],
  ['speed_preference', 'Speed preference', [['asap', 'ASAP'], ['1_2_weeks', '1–2 weeks'], ['within_30_days', '30 days'], ['longer_build', 'Longer build']]],
  ['weekly_hours', 'Weekly hours', [['lt_5', '<5'], ['5_10', '5–10'], ['11_20', '11–20'], ['20_plus', '20+']]],
  ['work_location_preference', 'Work location', [['online', 'Online'], ['local_in_person', 'Local'], ['either', 'Either']]],
  ['sales_comfort', 'Sales comfort (1–4)', [['1', '1 — dislikes'], ['2', '2 — little'], ['3', '3 — comfortable'], ['4', '4 — enjoys']]],
  ['customer_interaction_preference', 'Customer interaction', [['minimal', 'Minimal'], ['some', 'Some'], ['indifferent', "Don't care"], ['high', 'High']]],
  ['business_model_preference', 'Business preference', [['service', 'Service'], ['digital', 'Digital'], ['product', 'Product'], ['rental', 'Rental'], ['content', 'Content'], ['no_preference', 'No preference']]],
  ['physical_work_tolerance', 'Physical tolerance (1–4)', [['1', '1 — none'], ['2', '2 — light'], ['3', '3 — moderate'], ['4', '4 — heavy']]],
  ['income_goal', 'Income goal', [['under_500', '<$500'], ['500_1000', '$500–$1k'], ['1000_2500', '$1k–$2.5k'], ['2500_5000', '$2.5k–$5k'], ['5000_plus', '$5k+']]],
  ['primary_priority', 'Primary priority', [['speed', 'Fastest revenue'], ['cost', 'Lowest cost'], ['flexibility', 'Flexibility'], ['automation', 'Automation'], ['scale', 'Long-term scale'], ['enjoyment', 'Enjoyment']]],
];

export const ARRAY_FIELDS = [
  ['skills', 'Skills (comma separated: people, sales, writing, design, video, photography, technology, ai, organization, teaching, fitness, cooking, beauty, repairs, automotive, cleaning, landscaping, events, gaming, social_media)'],
  ['interests', 'Interests (comma separated: gaming, technology, ai, automotive, pets, fitness, beauty, fashion, food, home, outdoors, education, business, events, children, media, art, music, social_media, ecommerce)'],
  ['assets', 'Assets (comma separated: vehicle, computer, smartphone, tools, workspace, audience_following, camera, specialized_equipment)'],
];

export const DEFAULT_TEST_PROFILE_FORM = {
  startup_budget: '0_50',
  speed_preference: 'within_30_days',
  weekly_hours: '5_10',
  work_location_preference: 'either',
  sales_comfort: '3',
  customer_interaction_preference: 'some',
  business_model_preference: 'no_preference',
  physical_work_tolerance: '3',
  income_goal: '1000_2500',
  primary_priority: 'speed',
  skills: 'technology, ai',
  interests: '',
  assets: 'computer, smartphone',
};

export function buildTestProfile(form) {
  const parseArr = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    ...form,
    sales_comfort: Number(form.sales_comfort),
    physical_work_tolerance: Number(form.physical_work_tolerance),
    skills: parseArr(form.skills),
    interests: parseArr(form.interests),
    assets: parseArr(form.assets),
  };
}