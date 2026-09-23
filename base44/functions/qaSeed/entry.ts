import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

// QA-account seeding function. Runs AS the invoking user and hard-refuses
// anyone except the designated isolated QA test account — so every record it
// creates is genuinely owned by that account through its own token (normal
// RLS, no permission broadening). The service role is used ONLY for the
// Purchase record, whose create rule is admin-only by design because
// purchases are fulfilled server-side (same path a real payment takes).
const QA_EMAIL = 'besorahllc+hustledropqa@gmail.com';
const MODEL_RESUME = '6ab1b8eb9cf3fd53f4e0865b';
const MODEL_COPY = '6ab1b8eb9cf3fd53f4e08682';
const MODEL_DECK = '6ab1b8eb9cf3fd53f4e08681';

// PRODUCTION KILL SWITCH — the isolated QA environment is already seeded.
// The endpoint refuses everything while disabled, BEFORE any read or write,
// so it can never reset or rewrite data in production. Flip ENABLED to true
// only when the QA account needs reseeding.
const ENABLED = false;

export default async function(req) {
  try {
    if (!ENABLED) return Response.json({ error: 'QA seeding is disabled.' }, { status: 403 });
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.email !== QA_EMAIL) {
      return Response.json({ error: 'Restricted to the designated QA test account.' }, { status: 403 });
    }
    const QA_ID = user.id;
    const nowIso = new Date().toISOString();

    // Idempotent: remove only THIS account's previous seed records first.
    const oldSels = await base44.entities.SelectedBusiness.filter({ user_id: QA_ID });
    for (const s of oldSels) {
      await base44.entities.GeneratedAsset.deleteMany({ selected_business_id: s.id });
      await base44.entities.SelectedBusiness.delete(s.id);
    }
    await base44.entities.MatchResult.deleteMany({ user_id: QA_ID });
    await base44.entities.HustleProfile.deleteMany({ user_id: QA_ID });
    await base44.entities.HustleDNAProfile.deleteMany({ user_id: QA_ID });

    // 1) Hustle profile
    const profile = await base44.entities.HustleProfile.create({
      user_id: QA_ID,
      startup_budget: '251_500', speed_preference: 'fast', weekly_hours: '5_10',
      work_location_preference: 'online', sales_comfort: 2,
      customer_interaction_preference: 'some',
      skills: ['writing', 'communication', 'organization'],
      business_model_preference: 'service', physical_work_tolerance: 1,
      income_goal: '500_1000', primary_priority: 'speed',
      interests: ['career', 'technology', 'writing'],
      assets: ['laptop', 'smartphone'], profile_complete: true,
    });

    // 2) Match result set
    const setId = 'qaset_' + Date.now();
    const mkMatch = (rank, modelId, fit, pos, neg) =>
      base44.entities.MatchResult.create({
        user_id: QA_ID, profile_id: profile.id, business_model_id: modelId,
        rank, personal_fit: fit, match_confidence: 85, result_set_id: setId,
        tie_breaker_needed: false, positive_factors: pos, negative_factors: neg,
        score_breakdown: {
          base: 55,
          factors: { budget_fit: 12, skill_alignment: 10, speed_fit: 8, sales_fit: 6, online_fit: 6 },
          penalties: [], bonuses: [], unrounded: fit + 0.4,
        },
      });
    const m1 = await mkMatch(1, MODEL_RESUME, 88,
      ['low_startup_cost', 'skill_alignment', 'fast_launch_fit', 'budget_fit'], ['sales_intensity']);
    await mkMatch(2, MODEL_COPY, 81, ['low_startup_cost', 'fast_launch_fit'], ['sales_intensity']);
    await mkMatch(3, MODEL_DECK, 74, ['low_startup_cost', 'skill_alignment'], ['slow_validation']);

    // 3) HustleDNA profile
    await base44.entities.HustleDNAProfile.create({
      user_id: QA_ID,
      hustler_score: 35, digital_builder_score: 62, creator_score: 78,
      connector_score: 55, operator_score: 45, builder_score: 40,
      primary_type: 'creator', secondary_type: 'digital_builder', supporting_type: 'connector',
      hustle_code: 'CR-DB',
      revenue_tempo: 35, work_mode: 70, social_energy: 40, growth_style: 50,
      selling_style: 30, risk_approach: 25,
      strengths: ['creative_differentiator', 'communicator', 'systems_thinker'],
      traps: ['perfection_loop', 'sales_avoidance'],
    });

    // 4) Selected business — Resume & LinkedIn service
    const sel = await base44.entities.SelectedBusiness.create({
      user_id: QA_ID, business_model_id: MODEL_RESUME, match_result_id: m1.id,
      status: 'building', selected_at: nowIso,
    });

    // 5) Six accepted Build missions (content shapes match the real flow)
    const A = (module_type, content, meta) =>
      base44.entities.GeneratedAsset.create({
        user_id: QA_ID, selected_business_id: sel.id, module_type, version: 1,
        content, status: 'accepted', accepted_at: nowIso, generation_metadata: meta || {},
      });

    const customerContent = {
      segments: [
        { who: 'Recent grads and early-career professionals hunting for their first corporate role',
          problem: 'Their self-written resume buries relevant experience and never makes it past recruiter skims.',
          why_buy: 'A sharp rewrite makes their limited experience read clearly, which matters most when they have the thinnest track record.',
          where_to_find: 'University alumni groups on LinkedIn and Facebook, first-job subreddits, campus career-service boards.',
          ease_of_reach: 'HIGH' },
        { who: 'Laid-off mid-career professionals re-entering the job market',
          problem: 'Their resume is years out of date and their LinkedIn profile still shows the old employer.',
          why_buy: 'Re-entering the market after a layoff is time-pressured, so outside help feels worth paying for.',
          where_to_find: 'Layoff-support groups on LinkedIn, outplacement communities, local job-seeker meetups.',
          ease_of_reach: 'MEDIUM' },
        { who: 'Small consultants whose LinkedIn profile is their whole storefront',
          problem: 'A thin profile makes independent consultants look less established than they are.',
          why_buy: 'Their profile directly influences whether prospects book a call with them.',
          where_to_find: 'Independent-consultant communities and Slack groups, LinkedIn itself.',
          ease_of_reach: 'LOW' },
      ],
      best_first_index: 0,
      best_first_reasoning: 'Grads are the fastest and cheapest to reach in existing free groups, and the writing effort per client is the smallest.',
      selected_segment_index: 0,
      selected_segment: 'Recent grads and early',
    };
    const offerContent = {
      offers: [
        { name: 'Resume Refresh Sprint', customer_gets: 'A fully rewritten one-page resume in editable files.',
          core_outcome: 'A resume that reads clearly in a 30-second recruiter skim.',
          delivery_method: 'Remote: intake form, then a Google Docs rewrite with two revision rounds.',
          included: ['Full rewrite of one resume', 'Keyword pass for applicant tracking systems', 'Two revision rounds', 'DOCX and PDF final files'],
          not_included: ['Cover letters', 'LinkedIn profile rewrite', 'Interview coaching'],
          delivery_effort: '2–3 hours per client', startup_requirements: 'Laptop you already own plus a free Google Docs template — effectively $0 to start.' },
        { name: 'Resume + LinkedIn Starter Pack', customer_gets: 'Rewritten resume plus an updated LinkedIn headline and About section.',
          core_outcome: 'A consistent story across the two places recruiters actually look.',
          delivery_method: 'Remote: intake form, resume rewrite, then LinkedIn text edits.',
          included: ['Everything in the resume sprint', 'New LinkedIn headline', 'Rewritten About section', 'One revision round on each'],
          not_included: ['Profile photo advice', 'Cover letters', 'Ongoing profile management'],
          delivery_effort: '3–4 hours per client', startup_requirements: 'Laptop only — LinkedIn edits need no paid tools.' },
        { name: 'LinkedIn Profile Glow-Up', customer_gets: 'Rewritten LinkedIn headline, About and experience sections.',
          core_outcome: 'A profile that explains what they do and who it helps in one skim.',
          delivery_method: 'Remote: short intake, then text-only edits delivered in a shared doc.',
          included: ['Headline rewrite', 'About section rewrite', 'Top three experience bullets rewritten'],
          not_included: ['Resume work', 'Photo selection', 'Endorsement strategy'],
          delivery_effort: '1–2 hours per client', startup_requirements: 'Laptop only — no costs required.' },
      ],
      recommended_index: 0,
      recommended_reasoning: 'Simplest to explain, cheapest to deliver, and easiest to test with grads — one clear outcome at one clear price.',
      selected_offer_index: 0, selected_offer: 'Resume Refresh Sprint',
      customized_included: ['Full rewrite of one resume', 'Keyword pass for applicant tracking systems', 'Two revision rounds', 'DOCX and PDF final files'],
      custom_addition: 'Free 15-minute intro call before we start',
    };
    const pricingContent = {
      test_price: '$150 per resume', lower_test: '$95 resume-only refresh for your first three clients',
      premium_version: '$275 for resume plus LinkedIn headline and About rewrite',
      why_this_range: 'At 2–3 hours of writing per resume, $150 keeps your effective rate realistic for a first-time service while staying inside what early-career clients expect to pay. The discounted first three engagements lower the barrier to getting real testimonials; the premium tier gives returning clients an easy next step.',
      assumptions: ['About 2–3 hours of writing per resume', 'You start solo with no paid tools', 'Revisions capped at two rounds', 'Laptop and Google Docs you already use', 'Clients send existing material — no research subscriptions'],
      break_even_example: 'Startup needs are roughly $30 (a premium document template and a grammar checker for a few months). At $150 per resume, one paid client covers that with $120 left over — plain arithmetic on your own numbers, not a forecast of demand.',
      chosen_price: 150,
      calc_assumptions: { price: 150, jobs_per_month: 2, cost_per_job: 10 },
    };
    const brandContent = {
      chosen_name: 'Next Chapter Resumes',
      tagline: 'Make the next door easier to open.',
      one_sentence_positioning: 'A writing-first resume and LinkedIn studio for early-career professionals who have real experience but need it told clearly.',
      brand_personality: 'Encouraging, precise, no-fluff, quietly confident — everything is warm but never hypey, and every sentence earns its place.',
      color_direction: 'Deep navy #1E3A5F for trust, warm amber #F59E0B for energy and optimism, off-white #F8FAFC for clarity — navy-led with amber accents.',
      visual_style: 'Clean editorial layout, generous white space, one strong serif for headings and a plain sans for body; single amber underline as the recurring accent, no stock-photo business clichés.',
      short_bio: 'Next Chapter Resumes rewrites resumes and LinkedIn profiles for early-career professionals.',
      customer_facing_description: 'We rewrite your resume and LinkedIn profile in your own voice — clear, skimmable and honest. Built for people early in their careers whose experience deserves to read as well as it happened. Designed to help you present your best real self, not to promise outcomes.',
    };
    const salesContent = {
      introduction: 'I rewrite resumes and LinkedIn profiles for people early in their careers — I make real experience read clearly.',
      dm_script: 'Hey Sam — I remember you mentioning your job hunt. I rewrite resumes for early-career folks; I would happily show you a before-and-after from a similar client. Want me to take a quick look at your current one, no strings attached?',
      email_script: 'Subject: A quick look at your resume?\n\nHi Sam,\n\nI help early-career professionals get their resumes reading clearly — the kind of rewrite that makes a 30-second recruiter skim count.\n\nHappy to take a free look at yours and tell you honestly whether it needs work. Want me to?\n\n[Name]',
      follow_up_1: 'Hi Sam — no pressure at all on the resume look-over; just floating it back up in case it got buried. Either way, good luck with the applications this week.',
      follow_up_2: 'Hey Sam, last nudge from me on this — if the resume is fine as-is that is genuinely great, and I will leave you to it. If you ever want a second pair of eyes, my door is open.',
      common_objection: 'I already wrote my resume myself — why would I pay someone to redo it?',
      objection_response: 'Totally fair — most of my clients wrote their own first. A rewrite is not about you being bad at writing; it is about reading it the way a recruiter skims it in 30 seconds, which is really hard to do for your own experience. That is the only thing I would change, and the intro call is free so you can judge first.',
      soft_close: 'No rush and no hard sell — if you want, send me the current version and I will tell you honestly whether it needs work before you spend anything.',
      call_to_action: 'Send your current resume over and I will reply with three specific things that are working and three that are not — free, no commitment.',
      chosen_tone: 'friendly', primary_channel: 'dm',
    };
    const marketingContent = {
      core_message: 'Your experience reads better than your resume does — I fix that.',
      social_posts: [
        'A recruiter skims your resume for about 30 seconds. Here is what the top third of the page should be doing in that time (and what most self-written resumes get wrong) — a quick breakdown in the comments.',
        'Rewrote a resume for a grad whose internship bullet said "assisted with projects". She had shipped a real tool the team still uses. Your experience is usually not the problem — the words are. That is fixable.',
        'Resume tip for first-job hunters: your bullets should start with a verb, carry a number if you have one, and never say "responsible for". Three rewrites of a common bullet in the comments.',
      ],
      short_form_ideas: [
        'Screen-record yourself skimming a fake resume for 30 seconds, then show what you actually registered.',
        'Before/after of ONE resume bullet — same experience, rewritten.',
        '"Things a resume is NOT": kills the myth that design matters more than clarity.',
      ],
      simple_promotion: 'Free 30-second resume teardown: anyone who comments gets one specific fix for their top bullet — done publicly in comments, no DM funnel.',
      referral_idea: 'For every client who sends you a friend who books, give the referrer a free LinkedIn headline rewrite — costs you 20 minutes.',
      online_marketing_idea: 'Answer resume questions in first-job subreddits and alumni Facebook groups with genuinely useful specifics, with your intro line in your profile — attraction, not mass DMs.',
      selected_channels: ['social', 'shortform', 'promo', 'referral', 'online'],
    };

    await A('customer', customerContent);
    await A('offer', offerContent, { based_on: { customer: 'accepted' } });
    await A('pricing', pricingContent, { based_on: { customer: 'accepted', offer: 'accepted' } });
    await A('brand', brandContent, { stage: 'identity' });
    await A('sales', salesContent, { based_on: { customer: 'accepted', offer: 'accepted' }, tone: 'friendly' });
    await A('marketing', marketingContent, { based_on: { customer: 'accepted', offer: 'accepted', sales: 'accepted' } });

    // 6) Completed purchase — server-side fulfillment path (admin-only create by
    // design), only if this business does not already have one.
    const existingPurchases = await base44.entities.Purchase.filter({
      user_id: QA_ID, product_key: 'build_my_business', selected_business_id: sel.id, status: 'completed',
    });
    let purchaseId = existingPurchases && existingPurchases[0] ? existingPurchases[0].id : null;
    if (!purchaseId) {
      const purchase = await base44.asServiceRole.entities.Purchase.create({
        user_id: QA_ID, product_key: 'build_my_business', selected_business_id: sel.id,
        amount: 1900, currency: 'usd', payment_provider: 'stripe',
        provider_checkout_id: 'cs_test_qa_seed_0001', provider_transaction_id: 'pi_test_qa_seed_0001',
        status: 'completed',
      });
      purchaseId = purchase.id;
    }

    // 7) Verify what the QA account itself can now read (RLS-enforced, user token)
    const [selList, assets, purchases, matches] = await Promise.all([
      base44.entities.SelectedBusiness.list('-selected_at', 10),
      base44.entities.GeneratedAsset.filter({ selected_business_id: sel.id }, '-created_date', 200),
      base44.entities.Purchase.filter({ user_id: QA_ID, product_key: 'build_my_business', status: 'completed' }),
      base44.entities.MatchResult.filter({ user_id: QA_ID }),
    ]);

    return Response.json({
      ok: true,
      seeded_for: user.email,
      profile_id: profile.id,
      profile_owner: profile.created_by_id === QA_ID ? 'qa' : 'UNEXPECTED',
      selection_id: sel.id,
      purchase_id: purchaseId,
      verify: {
        selection_visible: selList.length === 1 && selList[0].id === sel.id,
        accepted_modules: assets.filter((a) => a.status === 'accepted').map((a) => a.module_type).sort(),
        asset_owner_ok: assets.every((a) => a.created_by_id === QA_ID),
        entitlement_visible: purchases.length >= 1,
        matches_visible: matches.length,
      },
    });
  } catch (error) {
    return Response.json({ error: String((error && error.message) || error) }, { status: 500 });
  }
}