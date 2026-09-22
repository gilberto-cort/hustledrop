// Prompt + response-schema definitions for Business Builder modules.
// Deterministic software owns user data, progress, entitlements and saved
// choices; the AI only drafts content for ONE module per request. It can
// never alter Personal Fit, HustleDNA scores, eligibility or rankings.

export const BUILDER_MODULE_KEYS = ['customer', 'offer', 'pricing', 'brand', 'sales', 'marketing', 'launch'];

const SAFETY = `HARD SAFETY RULES — never violate any of these:
- Never guarantee income, profit or any probability of success.
- Never invent market-demand statistics, competitor pricing, testimonials, customers, reviews or grants.
- Never claim licensing, insurance, tax, zoning or permit compliance, and never claim a business name is legally available.
- Never encourage spam, mass unsolicited messaging or deceptive advertising, and never create fake urgency.
- Compliance: only when the user context contains compliance_flags, tell the user to verify those specific flagged items (e.g. insurance, local license, food rules) before operating. Never invent requirements, never add generic licensing boilerplate when no flags exist, and when uncertain say clearly what needs verification.
- Never make unsupported outcome claims such as "will get you noticed", "will land you a job", "will get more customers", "guaranteed" or "proven". Prefer "designed to", "helps you", "aims to", "built to", "can help".
- Use only facts present in the user context — never assume attributes that are not there.
- Be specific to THIS user and THIS business. No generic filler.`;

export const ASK_SAFETY = SAFETY;

const BUDGET_GUIDE = {
  '0_50': 'roughly $0–$50 available to start',
  '51_250': 'roughly $51–$250 available to start',
  '251_500': 'roughly $251–$500 available to start',
  '501_1000': 'roughly $501–$1,000 available to start',
  '1001_plus': 'more than $1,000 available to start',
};

const HOURS_GUIDE = {
  lt_5: 'under 5 hours per week',
  '5_10': 'about 5–10 hours per week',
  '11_20': 'about 11–20 hours per week',
  '20_plus': '20 or more hours per week',
};

const SALES_GUIDE = {
  1: 'strongly dislikes selling',
  2: 'has limited sales comfort',
  3: 'is comfortable with sales',
  4: 'enjoys selling',
};

const DNA_STYLE = {
  hustler: 'short missions, rapid outreach and quick feedback loops',
  digital_builder: 'simple systems and technology leverage — warn against premature automation',
  creator: 'strong presentation and content — warn against perfection loops',
  connector: 'relationship outreach, referrals and conversations',
  operator: 'checklists, repeatable workflows and tracking',
  builder: 'hands-on testing and tangible deliverables — warn against unnecessary equipment purchases',
};

function contextBlock(ctx) {
  return 'USER CONTEXT (their real data — do not invent anything beyond it):\n' + JSON.stringify(ctx, null, 2);
}

function dnaBlock(ctx) {
  const parts = [];
  if (ctx.primary_dna && DNA_STYLE[ctx.primary_dna]) {
    parts.push(`Their primary HustleDNA is ${String(ctx.primary_dna).toUpperCase()}: ${DNA_STYLE[ctx.primary_dna]}.`);
  }
  if (ctx.secondary_dna) {
    parts.push(`Their secondary HustleDNA is ${String(ctx.secondary_dna).toUpperCase()} — weave it in where natural, secondary to the primary.`);
  }
  return parts.join('\n');
}

function constraintsBlock(ctx) {
  const budget = BUDGET_GUIDE[ctx.startup_budget] || String(ctx.startup_budget || 'unspecified');
  const hours = HOURS_GUIDE[ctx.hours_available_weekly] || String(ctx.hours_available_weekly || 'unspecified');
  const sales = SALES_GUIDE[ctx.sales_comfort] || 'moderate sales comfort';
  return `Hard constraints: ${budget}; ${hours} available; the user ${sales}; work location preference: ${ctx.work_location_preference}; customer interaction preference: ${ctx.customer_interaction_preference}; primary priority: ${ctx.primary_priority}.`;
}

const SEGMENT_SCHEMA = {
  type: 'object',
  properties: {
    who: { type: 'string', description: 'WHO THEY ARE' },
    problem: { type: 'string', description: 'PROBLEM' },
    why_buy: { type: 'string', description: 'WHY THEY MIGHT BUY' },
    where_to_find: { type: 'string', description: 'WHERE TO FIND THEM' },
    ease_of_reach: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'], description: 'EASE OF REACH' },
  },
  required: ['who', 'problem', 'why_buy', 'where_to_find', 'ease_of_reach'],
};

const OFFER_SCHEMA_ITEM = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'OFFER NAME' },
    customer_gets: { type: 'string', description: 'WHAT THE CUSTOMER GETS' },
    core_outcome: { type: 'string', description: 'CORE OUTCOME' },
    delivery_method: { type: 'string', description: 'DELIVERY METHOD' },
    included: { type: 'array', items: { type: 'string' }, description: 'WHAT IS INCLUDED' },
    not_included: { type: 'array', items: { type: 'string' }, description: 'WHAT IS NOT INCLUDED' },
    delivery_effort: { type: 'string', description: 'ESTIMATED DELIVERY EFFORT' },
    startup_requirements: { type: 'string', description: 'STARTUP REQUIREMENTS — must fit the user budget' },
  },
  required: ['name', 'customer_gets', 'core_outcome', 'delivery_method', 'included', 'not_included', 'delivery_effort', 'startup_requirements'],
};

// NOTE: contextBlock() injects compliance_flags review language ONLY when the
// matched business model has non-empty compliance_flags — otherwise no
// compliance copy is generated anywhere.

export const MODULE_PROMPTS = {
  customer: (ctx) => ({
    prompt: `You are HustleDrop's Business Builder, generating Module 01 — CUSTOMER.

${contextBlock(ctx)}

${constraintsBlock(ctx)}
${dnaBlock(ctx)}

${SAFETY}

TASK: Identify 2–3 realistic potential customer segments for this specific business. Make them concrete and reachable for THIS user (their budget, hours, location and sales comfort), not generic personas.
For each segment provide: who (WHO THEY ARE), problem (the PROBLEM it solves for them), why_buy (WHY THEY MIGHT BUY), where_to_find (WHERE TO FIND THEM — concrete places or channels), ease_of_reach (LOW, MEDIUM or HIGH).
Then recommend the single best segment to test first (best_first_index, 0-based) with reasoning in best_first_reasoning — favor segments that are fast and cheap to reach for this user.
These segments are hypotheses to validate — never present them as verified demand.`,
    schema: {
      type: 'object',
      properties: {
        segments: { type: 'array', minItems: 2, maxItems: 3, items: SEGMENT_SCHEMA },
        best_first_index: { type: 'number' },
        best_first_reasoning: { type: 'string' },
      },
      required: ['segments', 'best_first_index', 'best_first_reasoning'],
    },
  }),

  offer: (ctx) => ({
    prompt: `You are HustleDrop's Business Builder, generating Module 02 — OFFER.

${contextBlock(ctx)}

The user has ACCEPTED this customer segment (find it in previously_approved_builder_choices.customer — use its "who" and "problem" as the target customer).

${constraintsBlock(ctx)}
${dnaBlock(ctx)}

${SAFETY}

TASK: Generate exactly 3 offer concepts for this accepted customer. Each offer: name (OFFER NAME), customer_gets (WHAT THE CUSTOMER GETS), core_outcome (CORE OUTCOME — the result the customer walks away with), delivery_method (DELIVERY METHOD), included (3–5 bullet items: WHAT IS INCLUDED), not_included (2–4 items: WHAT IS NOT INCLUDED), delivery_effort (ESTIMATED DELIVERY EFFORT, e.g. "2–3 hours per client"), startup_requirements (STARTUP REQUIREMENTS — must stay within the user's budget and use their existing assets where possible).
Then mark recommended_index (0-based) with recommended_reasoning. The recommendation must favor: simple, testable, within budget, quick to explain, possible with current assets. Never favor complexity merely because it sounds premium.`,
    schema: {
      type: 'object',
      properties: {
        offers: { type: 'array', minItems: 3, maxItems: 3, items: OFFER_SCHEMA_ITEM },
        recommended_index: { type: 'number' },
        recommended_reasoning: { type: 'string' },
      },
      required: ['offers', 'recommended_index', 'recommended_reasoning'],
    },
  }),

  pricing: (ctx) => ({
    prompt: `You are HustleDrop's Business Builder, generating Module 03 — PRICING.

${contextBlock(ctx)}

The user has accepted a customer segment (previously_approved_builder_choices.customer) and an offer (previously_approved_builder_choices.offer — base the pricing on its delivery effort and what is included).

${constraintsBlock(ctx)}

${SAFETY}

TASK: Create a starting pricing hypothesis. Provide:
- test_price: the main starting price to test (a clear string, e.g. "$120 per client" or "$45/month").
- lower_test: a lower-stakes variant for early validation (e.g. a discounted first engagement or smaller package).
- premium_version: a premium version of the same offer.
- why_this_range: 2–4 sentences explaining WHY THIS RANGE fits their budget, effort and customer.
- assumptions: 3–5 assumptions this pricing USES (e.g. time per delivery from the offer, that they start solo).
- break_even_example: a SIMPLE BREAK-EVEN EXAMPLE — plain arithmetic from their startup costs and price, clearly labeled as an example.
Never claim these prices reflect verified local market acceptance. Never fabricate competitor pricing. Price points must stay realistic for a first-time operator.`,
    schema: {
      type: 'object',
      properties: {
        test_price: { type: 'string' },
        lower_test: { type: 'string' },
        premium_version: { type: 'string' },
        why_this_range: { type: 'string' },
        assumptions: { type: 'array', items: { type: 'string' } },
        break_even_example: { type: 'string' },
      },
      required: ['test_price', 'lower_test', 'premium_version', 'why_this_range', 'assumptions', 'break_even_example'],
    },
  }),

  brand: (ctx, options) => {
    if (options && options.stage === 'identity') {
      return {
        prompt: `You are HustleDrop's Business Builder, generating Module 04 — BRAND (identity stage).

${contextBlock(ctx)}

${dnaBlock(ctx)}

${SAFETY}

TASK: The user has chosen the business name "${options.selected_name}". Generate the next layer of the brand, reflecting their accepted customer and offer:
- chosen_name: exactly "${options.selected_name}"
- tagline: a short tagline (5–8 words)
- one_sentence_positioning: a one-sentence positioning statement
- brand_personality: 3–5 personality traits plus one line of explanation
- color_direction: 2–3 concrete color directions (named, with hex suggestions)
- visual_style: a short paragraph on the suggested visual style and look-and-feel
- short_bio: a short internal bio of the business (1–2 sentences)
- customer_facing_description: how the business describes itself to customers (2–3 sentences)
Never claim domain, trademark or social-handle availability. Do not generate an actual logo. Customer-facing copy must not promise outcomes.`,
        schema: {
          type: 'object',
          properties: {
            chosen_name: { type: 'string' },
            tagline: { type: 'string' },
            one_sentence_positioning: { type: 'string' },
            brand_personality: { type: 'string' },
            color_direction: { type: 'string' },
            visual_style: { type: 'string' },
            short_bio: { type: 'string' },
            customer_facing_description: { type: 'string' },
          },
          required: ['chosen_name', 'tagline', 'one_sentence_positioning', 'brand_personality', 'color_direction', 'visual_style', 'short_bio', 'customer_facing_description'],
        },
      };
    }
    const seen = options && options.seen_names && options.seen_names.length
      ? `\nAvoid these previously suggested names: ${options.seen_names.join(', ')}.`
      : '';
    return {
      prompt: `You are HustleDrop's Business Builder, generating Module 04 — BRAND (name stage).

${contextBlock(ctx)}

${dnaBlock(ctx)}

${SAFETY}

TASK: Generate exactly 5 business name options for this business, suited to its accepted customer and offer. Each option: name (short, memorable, realistic for a small business — no obvious trademark collisions with major brands) and positioning (a one-line positioning statement).${seen}
Do not imply any name is legally available.`,
      schema: {
        type: 'object',
        properties: {
          name_options: {
            type: 'array',
            minItems: 5,
            maxItems: 5,
            items: {
              type: 'object',
              properties: { name: { type: 'string' }, positioning: { type: 'string' } },
              required: ['name', 'positioning'],
            },
          },
        },
        required: ['name_options'],
      },
    };
  },

  sales: (ctx, options = {}) => {
    const PITCH_TONE = {
      friendly: 'PITCH TONE: warm and friendly — casual, human, low-pressure.',
      direct: 'PITCH TONE: direct and clear — short sentences, to the point, but never pushy.',
      value: 'PITCH TONE: value-first — lead with what the customer gets before asking for anything.',
    };
    const toneLine = PITCH_TONE[options.tone]
      ? `\n${PITCH_TONE[options.tone]}\nThis user-chosen tone takes priority over the default sales-comfort adaptation of tone.`
      : '';
    return {
    prompt: `You are HustleDrop's Business Builder, generating Module 05 — SALES.

${contextBlock(ctx)}

The user has accepted a customer segment and an offer (in previously_approved_builder_choices). The sales kit must speak to THAT customer about THAT offer.

${constraintsBlock(ctx)}
${dnaBlock(ctx)}${toneLine}

${SAFETY}

TASK: Generate a practical FIRST-CUSTOMER sales kit. Adapt the tone to this user: someone who strongly dislikes selling receives lower-pressure, gentle outreach scripts; someone comfortable with or enjoying sales can receive more direct outreach.
Provide:
- introduction: a SHORT INTRODUCTION (how they describe the business in one breath)
- dm_script: a DM/TEXT SCRIPT (short, personal, one clear question at the end)
- email_script: an EMAIL SCRIPT (short subject + body)
- in_person_script: an IN-PERSON SCRIPT (include only if the business or user's location preference makes in-person relevant; otherwise omit this field)
- follow_up_1: FOLLOW-UP #1 (polite, no pressure)
- follow_up_2: FOLLOW-UP #2 (final gentle nudge)
- common_objection: the most COMMON OBJECTION for this offer
- objection_response: a honest RESPONSE to it
- soft_close: a SOFT CLOSE (no fake urgency)
- call_to_action: a clear CALL TO ACTION for the first conversation
Everything must feel personal and specific. No deceptive urgency. No spam — always one-to-one, never mass messaging.`,
    schema: {
      type: 'object',
      properties: {
        introduction: { type: 'string' },
        dm_script: { type: 'string' },
        email_script: { type: 'string' },
        in_person_script: { type: 'string' },
        follow_up_1: { type: 'string' },
        follow_up_2: { type: 'string' },
        common_objection: { type: 'string' },
        objection_response: { type: 'string' },
        soft_close: { type: 'string' },
        call_to_action: { type: 'string' },
      },
      required: ['introduction', 'dm_script', 'email_script', 'follow_up_1', 'follow_up_2', 'common_objection', 'objection_response', 'soft_close', 'call_to_action'],
    },
    };
  },

  marketing: (ctx) => ({
    prompt: `You are HustleDrop's Business Builder, generating Module 06 — MARKETING.

${contextBlock(ctx)}

The kit targets the user's accepted customer and offer (in previously_approved_builder_choices).

${constraintsBlock(ctx)}
${dnaBlock(ctx)}

${SAFETY}

TASK: Create a small launch marketing kit:
- core_message: the CORE MESSAGE (one sentence that makes the right person curious)
- social_posts: exactly 3 SOCIAL POSTS (ready-to-use text, platform-appropriate)
- short_form_ideas: exactly 3 SHORT-FORM CONTENT IDEAS (one line each)
- simple_promotion: 1 SIMPLE PROMOTION (cheap or free to run)
Then include ONLY the ones that genuinely fit this business and user — omit any that don't (do not fill space with irrelevant channels):
- referral_idea: a REFERRAL IDEA
- local_marketing_idea: a LOCAL MARKETING IDEA
- online_marketing_idea: an ONLINE MARKETING IDEA`,
    schema: {
      type: 'object',
      properties: {
        core_message: { type: 'string' },
        social_posts: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
        short_form_ideas: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'string' } },
        simple_promotion: { type: 'string' },
        referral_idea: { type: 'string' },
        local_marketing_idea: { type: 'string' },
        online_marketing_idea: { type: 'string' },
      },
      required: ['core_message', 'social_posts', 'short_form_ideas', 'simple_promotion'],
    },
  }),

  launch: (ctx) => ({
    prompt: `You are HustleDrop's Business Builder, generating Module 07 — LAUNCH.

${contextBlock(ctx)}

The sprint builds on the user's accepted customer, offer, pricing and sales kit (in previously_approved_builder_choices).

${constraintsBlock(ctx)}
${dnaBlock(ctx)}

${SAFETY}

TASK: Create a personalized 7-DAY VALIDATION SPRINT. Its purpose is NOT to build the entire company in seven days — it is to get real-world feedback and move toward the first qualified customer conversation.
Provide sprint_days: exactly 7 entries, day 1 through day 7, each with:
- primary_action: ONE PRIMARY ACTION for that day (concrete and doable)
- why_it_matters: WHY IT MATTERS (one sentence)
- estimated_time: ESTIMATED TIME (must be realistic — the user has ${HOURS_GUIDE[ctx.hours_available_weekly] || 'limited'} hours per week)
- estimated_cost: ESTIMATED COST (the whole sprint must stay within their startup budget; favor testing before purchasing equipment)
Also provide execution_note: 1–2 sentences on how to execute this sprint given their HustleDNA style above.`,
    schema: {
      type: 'object',
      properties: {
        sprint_days: {
          type: 'array',
          minItems: 7,
          maxItems: 7,
          items: {
            type: 'object',
            properties: {
              day: { type: 'number' },
              primary_action: { type: 'string' },
              why_it_matters: { type: 'string' },
              estimated_time: { type: 'string' },
              estimated_cost: { type: 'string' },
            },
            required: ['day', 'primary_action', 'why_it_matters', 'estimated_time', 'estimated_cost'],
          },
        },
        execution_note: { type: 'string' },
      },
      required: ['sprint_days', 'execution_note'],
    },
  }),
};