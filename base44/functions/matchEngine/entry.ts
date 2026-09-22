import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { computeMatches, detectTie } from '../../shared/matchingEngine.js';

const MODEL_FIELDS = [
  'id', 'name', 'description', 'family', 'startup_min', 'startup_max',
  'online_score', 'local_score', 'speed_to_first_sale', 'physical_intensity',
  'sales_intensity', 'automation_potential', 'customer_interaction',
  'recurring_revenue_potential', 'scalability', 'weekend_friendly',
  'first_validation_action', 'verification_warning',
];

function categoryFromScore(score) {
  const s = Number(score) || 0;
  return s >= 85 ? 'HIGH' : s >= 65 ? 'GOOD' : 'LIMITED';
}

function projectModel(m) {
  const out = {};
  for (const f of MODEL_FIELDS) out[f] = m[f];
  return out;
}

async function loadActiveModels(base44) {
  return base44.entities.BusinessModel.filter({ active: true }, 'name', 500);
}

function buildMatches(records, modelsById) {
  return (records || [])
    .map((r) => {
      const model = modelsById[r.business_model_id];
      if (!model) return null;
      return {
        result_id: r.id,
        rank: r.rank,
        personal_fit: r.personal_fit,
        match_confidence: r.match_confidence,
        score_breakdown: r.score_breakdown || {},
        positive_factors: r.positive_factors || [],
        negative_factors: r.negative_factors || [],
        tie_breaker_used: r.tie_breaker_used || null,
        tie_breaker_needed: !!r.tie_breaker_needed,
        business_model: projectModel(model),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    // ---------- ADMIN-ONLY TEST MODE ----------
    // Runs the engine on a temporary profile. Nothing is saved; the caller's
    // real HustleProfile and results are never touched.
    if (body && body.test_profile) {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const models = await loadActiveModels(base44);
      const { eligible, filtered, confidence } = computeMatches(body.test_profile, models);
      return Response.json({
        status: 'ok',
        mode: 'test',
        confidence,
        eligibleCount: eligible.length,
        eligible: eligible.map((s) => ({
          rank: s.rank,
          fit: s.fit,
          fitDisplay: s.fitDisplay,
          baseScore: s.baseScore,
          factors: s.factors,
          bonuses: s.bonuses,
          penalties: s.penalties,
          positives: s.positives,
          negatives: s.negatives,
          model: { id: s.model.id, name: s.model.name, family: s.model.family },
        })),
        filtered: filtered.map((f) => ({
          model: { id: f.model.id, name: f.model.name },
          reasons: f.reasons,
        })),
      });
    }

    // ---------- REAL MATCH RUN ----------
    // 1. Load the caller's completed profile (explicitly user-scoped —
    // server-side SDK clients bypass RLS)
    const profiles = await base44.entities.HustleProfile.filter({ user_id: user.id }, '-created_date', 5);
    const profile = profiles && profiles[0];
    if (!profile || !profile.profile_complete) {
      return Response.json({ status: 'no_profile' });
    }

    // 2. Deterministic result set — the set id is derived from the profile and
    // its last update, so retries and racing double-invocations (navigation,
    // refresh, sign-out/in) converge on ONE set instead of duplicating records.
    // Rematches (profile edited) produce a new id and never corrupt history.
    const existing = await base44.entities.MatchResult.filter({ user_id: user.id }, '-created_date', 20);
    const profileStamp = profile.updated_date ? new Date(profile.updated_date).getTime() : 0;
    const setId = 'rs_' + profile.id + '_' + profileStamp;
    const currentSet = (existing || []).filter((r) => r.result_set_id === setId);
    if (currentSet.length >= 3) {
      const models = await loadActiveModels(base44);
      const modelsById = {};
      models.forEach((m) => { modelsById[m.id] = m; });
      return Response.json({
        status: 'ok',
        created: false,
        matches: buildMatches(currentSet, modelsById),
        confidence: {
          score: currentSet[0].match_confidence,
          category: categoryFromScore(currentSet[0].match_confidence),
        },
        tie_breaker_needed: currentSet.some((r) => r.tie_breaker_needed),
      });
    }
    // Legacy freshness guard for sets saved before deterministic ids (and any
    // set created after the profile's last update).
    if (existing && existing.length >= 3) {
      const setId = existing[0].result_set_id;
      const setRecords = existing.filter((r) => r.result_set_id === setId);
      const isCurrent =
        setRecords.length >= 3 &&
        profile.updated_date &&
        existing[0].created_date &&
        new Date(existing[0].created_date).getTime() >= new Date(profile.updated_date).getTime();
      if (isCurrent) {
        const models = await loadActiveModels(base44);
        const modelsById = {};
        models.forEach((m) => { modelsById[m.id] = m; });
        return Response.json({
          status: 'ok',
          created: false,
          matches: buildMatches(setRecords, modelsById),
          confidence: {
            score: setRecords[0].match_confidence,
            category: categoryFromScore(setRecords[0].match_confidence),
          },
          tie_breaker_needed: setRecords.some((r) => r.tie_breaker_needed),
        });
      }
    }

    // 3–5. Load active models, apply hard filters, score and rank (deterministic, no AI)
    const models = await loadActiveModels(base44);
    const { eligible, confidence } = computeMatches(profile, models);

    if (!eligible || eligible.length === 0) {
      return Response.json({
        status: 'ok',
        created: true,
        matches: [],
        confidence,
        tie_breaker_needed: false,
      });
    }

    const tieNeeded = detectTie(eligible);

    // 6. Persist the top 3 as a new MatchResult set (deterministic setId above)
    const top = eligible.slice(0, 3);
    const records = top.map((r) => ({
      user_id: profile.user_id || user.id,
      profile_id: profile.id,
      business_model_id: r.model.id,
      rank: r.rank,
      personal_fit: Math.round(r.fit),
      match_confidence: confidence.score,
      score_breakdown: {
        factors: r.factors,
        base_score: r.baseScore,
        penalties: r.penalties,
        bonuses: r.bonuses,
        fit_unrounded: r.fit,
      },
      positive_factors: r.positives,
      negative_factors: r.negatives,
      tie_breaker_used: null,
      tie_breaker_needed: r.rank <= 2 ? tieNeeded : false,
      result_set_id: setId,
    }));
    await base44.entities.MatchResult.bulkCreate(records);

    // Racing retries can double-create the same set — converge on the earliest
    // record per rank (idempotent even under concurrent invocation).
    const after = await base44.entities.MatchResult.filter(
      { user_id: user.id, result_set_id: setId },
      'created_date',
      20
    );
    const keep = {};
    for (const r of after || []) {
      if (!keep[r.rank] || r.created_date < keep[r.rank].created_date) keep[r.rank] = r;
    }
    const keptIds = new Set(Object.values(keep).map((r) => r.id));
    for (const r of after || []) {
      if (!keptIds.has(r.id)) await base44.entities.MatchResult.delete(r.id);
    }
    const finalSet = (after || []).filter((r) => keptIds.has(r.id)).sort((a, b) => a.rank - b.rank);

    const modelsById = {};
    models.forEach((m) => { modelsById[m.id] = m; });

    // 7. Return the top 3
    return Response.json({
      status: 'ok',
      created: true,
      matches: buildMatches(finalSet, modelsById),
      confidence,
      tie_breaker_needed: tieNeeded,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}