// Shared context assembly for the Business Builder.
// Deterministic software owns ALL user data and state. This module only
// collects real records and assembles the generation context — it never calls
// AI, never invents missing attributes, and never touches Personal Fit,
// HustleDNA scores, eligibility or rankings.

// Which accepted upstream modules each module needs before it can generate.
// Changing an upstream module NEVER auto-regenerates dependents — the client
// just flags them REVIEW RECOMMENDED.
export const DEPENDENCIES = {
  offer: ['customer'],
  pricing: ['offer'],
  brand: ['offer'],
  sales: ['customer', 'offer'],
  marketing: ['customer', 'offer'],
  launch: ['customer', 'offer'],
};

export function assembleContext({ profile, model, brandName, fit, dna, positives, negatives, acceptedChoices }) {
  const ctx = {
    business_name: brandName || model.name,
    business_category: model.family,
    business_description: model.description,
    income_model: model.income_model,
    typical_offer_type: model.typical_offer_type,
    compliance_flags: Array.isArray(model.compliance_flags) && model.compliance_flags.length ? model.compliance_flags : undefined,
    personal_fit: fit,
    startup_budget: profile.startup_budget,
    hours_available_weekly: profile.weekly_hours,
    work_location_preference: profile.work_location_preference,
    sales_comfort: profile.sales_comfort,
    customer_interaction_preference: profile.customer_interaction_preference,
    physical_tolerance: profile.physical_work_tolerance,
    primary_priority: profile.primary_priority,
    skills: profile.skills || [],
    interests: profile.interests || [],
    assets: profile.assets || [],
    primary_dna: dna ? dna.primary_type : undefined,
    secondary_dna: dna ? dna.secondary_type : undefined,
    hustle_code: dna ? dna.hustle_code : undefined,
    match_positive_factors: positives || [],
    match_negative_factors: negatives || [],
    previously_approved_builder_choices: acceptedChoices || {},
  };
  // Missing attributes are omitted — never invented.
  for (const k of Object.keys(ctx)) {
    if (ctx[k] === undefined || ctx[k] === null) delete ctx[k];
  }
  return ctx;
}

// Loads the caller's own records and builds the generation context.
// Server-side SDK clients bypass RLS, so every load is explicitly scoped to
// the caller's user id — one user's data can never feed another's context.
export async function loadBuilderContext(base44, module_type, userId) {
  const profiles = await base44.entities.HustleProfile.filter({ user_id: userId }, '-created_date', 5);
  const profile = profiles && profiles[0];
  if (!profile || !profile.profile_complete) return { error: 'no_profile' };

  // ACTIVE = most recently SELECTED (selected_at), matching the client. Never
  // created_date — after a switch-back the newest record can be a different
  // business, which would scope generation to the wrong selection.
  const selections = await base44.entities.SelectedBusiness.filter({ user_id: userId }, '-selected_at', 10);
  const selection = selections && selections[0];
  if (!selection) return { error: 'no_selection' };

  const model = await base44.entities.BusinessModel.get(selection.business_model_id);

  let dna = null;
  const dnaRows = await base44.entities.HustleDNAProfile.filter({ user_id: userId }, '-created_date', 5);
  if (dnaRows && dnaRows[0]) dna = dnaRows[0];

  let fit = null;
  let positives = [];
  let negatives = [];
  const matchResults = await base44.entities.MatchResult.filter({ user_id: userId }, '-created_date', 10);
  // Scope to the business the user is ACTUALLY building — after a rematch the
  // newest result set belongs to a different business and must never leak
  // its fit or match factors into this business's generation context.
  const own = (matchResults || []).find((r) => r.business_model_id === selection.business_model_id);
  if (own) {
    fit = own.personal_fit;
    positives = own.positive_factors || [];
    negatives = own.negative_factors || [];
  }

  const assets = await base44.entities.GeneratedAsset.filter(
    { selected_business_id: selection.id, user_id: userId },
    '-created_date',
    200
  );

  // Latest accepted version per module (only one accepted at a time)
  const latestAccepted = {};
  for (const a of assets || []) {
    if (a.status !== 'accepted') continue;
    const cur = latestAccepted[a.module_type];
    if (!cur || Number(a.version || 0) > Number(cur.version || 0)) latestAccepted[a.module_type] = a;
  }

  // Dependent modules require their upstream to be accepted first.
  const missing = (DEPENDENCIES[module_type] || []).filter((d) => !latestAccepted[d]);
  if (missing.length > 0) return { error: 'missing_upstream', missing };

  const accepted = {};
  for (const k of Object.keys(latestAccepted)) accepted[k] = latestAccepted[k].content;

  const brandAsset = latestAccepted.brand;
  const brandName = brandAsset && brandAsset.content ? (brandAsset.content.chosen_name || null) : null;

  // Snapshot of the upstream accepted versions this generation is based on —
  // used later to flag REVIEW RECOMMENDED, never for scoring.
  const basedOn = {};
  for (const d of DEPENDENCIES[module_type] || []) {
    if (latestAccepted[d]) basedOn[d] = latestAccepted[d].id;
  }

  // Brand name regeneration avoids previously suggested names.
  let seenBrandNames = [];
  if (module_type === 'brand') {
    seenBrandNames = (assets || [])
      .filter((a) => a.module_type === 'brand' && a.content && Array.isArray(a.content.name_options))
      .flatMap((a) => a.content.name_options.map((o) => o && o.name))
      .filter(Boolean);
  }

  const context = assembleContext({ profile, model, brandName, fit, dna, positives, negatives, acceptedChoices: accepted });
  return { context, selection, model, fit, dna, accepted, latestAccepted, basedOn, seenBrandNames };
}