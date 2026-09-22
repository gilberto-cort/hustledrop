// Prompt specs for GROW MODE generation. Same stance as the Business
// Builder: the AI drafts content only — it never touches scores, matching,
// accepted assets or customer records, and never makes outcome guarantees.

export const GROW_SAFETY = `
SAFETY RULES (non-negotiable):
- Never guarantee income, revenue, customers, growth or business success. Use "designed to help" framing, never "will get you results".
- Never fabricate reviews or testimonials, and never write a testimonial pretending to be the customer.
- Never suggest incentives that require a positive review.
- Never suggest spam, mass unpersonalized outreach, or collecting contacts of the customer's friends without their permission.
- One or a few customers is NOT proof of demand. Any pattern must be framed as an early hypothesis based on limited evidence.
- Everything must be actionable with the user's real budget and weekly hours.
- Match the user's HustleDNA when it shapes coaching style, but never let it override practical business requirements.
`;

export const GROW_MISSION_KEYS = ['review', 'referral', 'repeat_win', 'system'];

function userBlock(context) {
  return `
USER CONTEXT (their real records — never invent data):
${JSON.stringify(context, null, 2)}
`;
}

export const GROW_PROMPTS = {
  // THE REVIEW — an honest feedback + optional review request for a real customer.
  review: (context) => ({
    prompt: `You are HustleDrop's Grow Mode writing a short follow-up message THE USER will send to THEIR customer after a completed purchase.
${GROW_SAFETY}
${userBlock(context)}

Write one short message (under 120 words) the user can copy and send. It must:
1. Thank the customer for their purchase.
2. Ask how the experience went.
3. Ask what could have been improved.
4. Only if it fits naturally, ask whether they would be comfortable leaving an honest review if they want to — no pressure, no incentive.

Use [Customer name] as the placeholder for the customer's name. Match this specific business and its tone. Plain text only.`,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'The copyable follow-up message' },
      },
      required: ['message'],
    },
  }),

  // THE REFERRAL — a simple, ethical referral mechanism.
  referral: (context) => ({
    prompt: `You are HustleDrop's Grow Mode building a simple, ethical referral mechanism for the user's business.
${GROW_SAFETY}
${userBlock(context)}

Create a lightweight referral kit:
- referral_message: a short message the user can send to a satisfied customer, in the spirit of "Know someone who could use this?" — adapted to this business.
- referral_offer: a simple, honest way to thank referring customers. It must NOT require a positive review and must fit the user's budget — a genuine thank-you is fine.
- shareable_description: one or two sentences the customer can forward to describe the service.
- tracking_note: one sentence on how the user can simply keep track of who referred whom (no software needed).

Adapt everything to this specific business and its customers. Never suggest collecting friends' contact information without permission, and never suggest spam loops.`,
    schema: {
      type: 'object',
      properties: {
        referral_message: { type: 'string' },
        referral_offer: { type: 'string' },
        shareable_description: { type: 'string' },
        tracking_note: { type: 'string' },
      },
      required: ['referral_message', 'referral_offer', 'shareable_description'],
    },
  }),

  // REPEAT THE WIN — early-hypothesis analysis of how customer #1 arrived.
  repeat_win: (context, options = {}) => ({
    prompt: `You are HustleDrop's Grow Mode analyzing how the user acquired their FIRST customer.
${GROW_SAFETY}
${userBlock(context)}

The user recorded that their first customer found them via: ${options.source || 'unknown'}.

Produce an early-hypothesis analysis:
- what_worked: what most plausibly contributed, based only on the recorded source and the user's real assets and activity.
- what_to_repeat: the single most reasonable action to attempt again.
- what_to_change: one thing to adjust before trying again.
- next_experiment: one small, concrete, low-cost experiment to run next.

Explicitly treat this as an early hypothesis based on ONE customer — never claim causation, validation or proven demand. Short, plain sentences.`,
    schema: {
      type: 'object',
      properties: {
        what_worked: { type: 'string' },
        what_to_repeat: { type: 'string' },
        what_to_change: { type: 'string' },
        next_experiment: { type: 'string' },
      },
      required: ['what_worked', 'what_to_repeat', 'what_to_change', 'next_experiment'],
    },
  }),

  // THE SYSTEM — a lightweight, business-specific customer loop.
  system: (context) => ({
    prompt: `You are HustleDrop's Grow Mode turning the user's repeated work into a simple repeatable operating loop.
${GROW_SAFETY}
${userBlock(context)}

Design "their customer loop": an ordered list of steps from finding prospects to asking for referrals and repeating. Guidelines:
- 6 to 10 steps, each one short sentence.
- Adapt the steps to this specific business model (${context.business_category || 'their business'} — e.g. a lawn-care service and an AI consulting service must NOT receive identical loops).
- Use only actions the user already does or can do with their current assets, budget and hours.
- No paid tools, no premature automation, no overbuilding — the loop must be runnable by one person this week.
- weekly_rhythm: 2-3 sentences on a simple weekly cadence for running the loop.`,
    schema: {
      type: 'object',
      properties: {
        loop_name: { type: 'string' },
        steps: { type: 'array', items: { type: 'string' } },
        weekly_rhythm: { type: 'string' },
      },
      required: ['loop_name', 'steps', 'weekly_rhythm'],
    },
  }),
};