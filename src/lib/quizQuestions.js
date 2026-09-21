// HustleMatch question definitions.
// Normalized internal values are stored; display labels are UI-only.

export const QUIZ_QUESTIONS = [
  {
    key: 'startup_budget',
    type: 'single',
    title: 'How much could you realistically put into getting started?',
    helper: 'You can always start smaller than your budget allows.',
    options: [
      { value: '0_50', label: '$0–$50' },
      { value: '51_250', label: '$51–$250' },
      { value: '251_500', label: '$251–$500' },
      { value: '501_1000', label: '$501–$1,000' },
      { value: '1001_plus', label: '$1,001+' },
    ],
  },
  {
    key: 'speed_preference',
    type: 'single',
    title: 'How quickly would you like the possibility of making your first sale?',
    options: [
      { value: 'asap', label: 'AS SOON AS POSSIBLE' },
      { value: '1_2_weeks', label: 'WITHIN 1–2 WEEKS' },
      { value: 'within_30_days', label: 'WITHIN 30 DAYS' },
      { value: 'longer_build', label: "I'M WILLING TO BUILD LONGER" },
    ],
  },
  {
    key: 'weekly_hours',
    type: 'single',
    title: 'How much time could you realistically give this each week?',
    options: [
      { value: 'lt_5', label: 'LESS THAN 5 HOURS' },
      { value: '5_10', label: '5–10 HOURS' },
      { value: '11_20', label: '11–20 HOURS' },
      { value: '20_plus', label: '20+ HOURS' },
    ],
  },
  {
    key: 'work_location_preference',
    type: 'single',
    title: 'Where would you rather work?',
    options: [
      { value: 'online', label: 'ONLINE' },
      { value: 'local_in_person', label: 'LOCALLY / IN PERSON' },
      { value: 'either', label: 'EITHER WORKS FOR ME' },
    ],
  },
  {
    key: 'sales_comfort',
    type: 'single',
    title: 'How do you feel about selling?',
    helper: "No judgment. This helps us avoid matching you with a business you'll hate running.",
    options: [
      { value: 1, label: "I REALLY DON'T LIKE IT" },
      { value: 2, label: 'I CAN DO A LITTLE' },
      { value: 3, label: "I'M COMFORTABLE WITH IT" },
      { value: 4, label: 'I ACTUALLY ENJOY IT' },
    ],
  },
  {
    key: 'customer_interaction_preference',
    type: 'single',
    title: 'How much customer interaction do you want?',
    options: [
      { value: 'minimal', label: 'AS LITTLE AS POSSIBLE' },
      { value: 'some', label: 'SOME IS FINE' },
      { value: 'indifferent', label: "I DON'T REALLY CARE" },
      { value: 'high', label: 'I LIKE WORKING WITH PEOPLE' },
    ],
  },
  {
    key: 'skills',
    type: 'multi',
    title: 'What are you naturally good at?',
    helper: 'Choose up to 5.',
    maxSelections: 5,
    options: [
      { value: 'people', label: 'PEOPLE' },
      { value: 'sales', label: 'SALES' },
      { value: 'writing', label: 'WRITING' },
      { value: 'design', label: 'DESIGN' },
      { value: 'video', label: 'VIDEO' },
      { value: 'photography', label: 'PHOTOGRAPHY' },
      { value: 'technology', label: 'TECHNOLOGY' },
      { value: 'ai', label: 'AI' },
      { value: 'organization', label: 'ORGANIZATION' },
      { value: 'teaching', label: 'TEACHING' },
      { value: 'fitness', label: 'FITNESS' },
      { value: 'cooking', label: 'COOKING' },
      { value: 'beauty', label: 'BEAUTY' },
      { value: 'repairs', label: 'REPAIRS' },
      { value: 'automotive', label: 'AUTOMOTIVE' },
      { value: 'cleaning', label: 'CLEANING' },
      { value: 'landscaping', label: 'LANDSCAPING' },
      { value: 'events', label: 'EVENTS' },
      { value: 'gaming', label: 'GAMING' },
      { value: 'social_media', label: 'SOCIAL MEDIA' },
    ],
  },
  {
    key: 'business_model_preference',
    type: 'single',
    title: 'What kind of business sounds most appealing?',
    options: [
      { value: 'service', label: 'SERVICE', description: 'Do something valuable for a customer.' },
      { value: 'digital', label: 'DIGITAL', description: 'Build or deliver primarily online.' },
      { value: 'product', label: 'PRODUCT', description: 'Create or sell something.' },
      { value: 'rental', label: 'RENTAL', description: 'Own something other people pay to use.' },
      { value: 'content', label: 'CONTENT', description: 'Build around media, education or an audience.' },
      { value: 'no_preference', label: 'NO PREFERENCE', description: 'Show me what fits.' },
    ],
  },
  {
    key: 'physical_work_tolerance',
    type: 'single',
    title: 'How physical are you willing for the business to be?',
    options: [
      { value: 1, label: 'NONE' },
      { value: 2, label: 'LIGHT' },
      { value: 3, label: 'MODERATE' },
      { value: 4, label: 'HEAVY IS FINE' },
    ],
  },
  {
    key: 'income_goal',
    type: 'single',
    title: 'What monthly income would you eventually like this business to work toward?',
    helper: 'This is a goal, not an earnings prediction.',
    options: [
      { value: 'under_500', label: 'UNDER $500' },
      { value: '500_1000', label: '$500–$1,000' },
      { value: '1000_2500', label: '$1,000–$2,500' },
      { value: '2500_5000', label: '$2,500–$5,000' },
      { value: '5000_plus', label: '$5,000+' },
    ],
  },
  {
    key: 'primary_priority',
    type: 'single',
    title: 'What matters most to you right now?',
    helper: 'Pick your single top priority.',
    options: [
      { value: 'speed', label: 'FASTEST PATH TO REVENUE' },
      { value: 'cost', label: 'LOWEST STARTUP COST' },
      { value: 'flexibility', label: 'FLEXIBILITY' },
      { value: 'automation', label: 'AUTOMATION' },
      { value: 'scale', label: 'LONG-TERM SCALE' },
      { value: 'enjoyment', label: 'ENJOYMENT' },
    ],
  },
  {
    key: 'interests',
    type: 'multi',
    title: 'What are you actually interested in?',
    helper: "Interests matter, but they won't override practical fit.",
    options: [
      { value: 'gaming', label: 'GAMING' },
      { value: 'technology', label: 'TECHNOLOGY' },
      { value: 'ai', label: 'AI' },
      { value: 'automotive', label: 'AUTOMOTIVE' },
      { value: 'pets', label: 'PETS' },
      { value: 'fitness', label: 'FITNESS' },
      { value: 'beauty', label: 'BEAUTY' },
      { value: 'fashion', label: 'FASHION' },
      { value: 'food', label: 'FOOD' },
      { value: 'home', label: 'HOME' },
      { value: 'outdoors', label: 'OUTDOORS' },
      { value: 'education', label: 'EDUCATION' },
      { value: 'business', label: 'BUSINESS' },
      { value: 'events', label: 'EVENTS' },
      { value: 'children', label: 'CHILDREN' },
      { value: 'media', label: 'MEDIA' },
      { value: 'art', label: 'ART' },
      { value: 'music', label: 'MUSIC' },
      { value: 'social_media', label: 'SOCIAL MEDIA' },
      { value: 'ecommerce', label: 'ECOMMERCE' },
    ],
  },
  {
    key: 'assets',
    type: 'multi',
    title: 'What do you already have access to?',
    helper: 'Select everything you already have.',
    exclusiveOption: 'none',
    options: [
      { value: 'vehicle', label: 'VEHICLE' },
      { value: 'computer', label: 'COMPUTER' },
      { value: 'smartphone', label: 'SMARTPHONE' },
      { value: 'tools', label: 'TOOLS' },
      { value: 'workspace', label: 'WORKSPACE' },
      { value: 'audience_following', label: 'AUDIENCE / FOLLOWING' },
      { value: 'camera', label: 'CAMERA' },
      { value: 'specialized_equipment', label: 'SPECIALIZED EQUIPMENT' },
      { value: 'none', label: 'NONE OF THESE' },
    ],
  },
];

export function isAnswerValid(question, answer) {
  if (question.type === 'single') {
    return answer !== undefined && answer !== null;
  }
  if (!Array.isArray(answer) || answer.length === 0) return false;
  if (question.exclusiveOption && answer.includes(question.exclusiveOption)) {
    return answer.length === 1;
  }
  return !question.maxSelections || answer.length <= question.maxSelections;
}

// Map completed quiz answers into a normalized HustleProfile payload.
export function buildHustleProfile(answers, userId) {
  return {
    user_id: userId || '',
    startup_budget: answers.startup_budget,
    speed_preference: answers.speed_preference,
    weekly_hours: answers.weekly_hours,
    work_location_preference: answers.work_location_preference,
    sales_comfort: Number(answers.sales_comfort),
    customer_interaction_preference: answers.customer_interaction_preference,
    skills: answers.skills || [],
    business_model_preference: answers.business_model_preference,
    physical_work_tolerance: Number(answers.physical_work_tolerance),
    income_goal: answers.income_goal,
    primary_priority: answers.primary_priority,
    interests: answers.interests || [],
    assets: answers.assets || [],
    profile_complete: true,
  };
}