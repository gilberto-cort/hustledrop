import { base44 } from '@/api/base44Client';
import { computeMatches } from './matchingEngine';

export async function getProfileForUser() {
  const rows = await base44.entities.HustleProfile.list('-created_date', 1);
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function getActiveModels() {
  return base44.entities.BusinessModel.filter({ active: true }, 'name', 500);
}

function newResultSetId() {
  return 'rs_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Returns persisted MatchResult records (rank 1..3) for the profile.
// Reuses the stored result set unless the profile changed after it was created —
// rematches create a NEW set and never corrupt historical results.
export async function getOrCreateMatchResults(profile, models) {
  const existing = await base44.entities.MatchResult.list('-created_date', 10);
  if (existing && existing.length > 0) {
    const setId = existing[0].result_set_id;
    const setRecords = existing.filter((r) => r.result_set_id === setId);
    const resultsAreCurrent =
      setRecords.length >= 3 &&
      profile.updated_date &&
      existing[0].created_date &&
      new Date(existing[0].created_date).getTime() >= new Date(profile.updated_date).getTime();
    if (resultsAreCurrent) {
      return { results: setRecords, created: false };
    }
  }

  const { eligible, confidence } = computeMatches(profile, models);
  const setId = newResultSetId();
  const top = eligible.slice(0, 3);
  if (top.length === 0) return { results: [], created: false, confidence };

  const records = top.map((r) => ({
    user_id: profile.user_id,
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
    result_set_id: setId,
  }));

  const created = await base44.entities.MatchResult.bulkCreate(records);
  return { results: created, created: true, confidence };
}

// Enrich persisted MatchResults with their models + engine-shaped data for the UI.
export function buildMatchView(results, models) {
  const byId = new Map((models || []).map((m) => [m.id, m]));
  return (results || [])
    .map((r) => {
      const model = byId.get(r.business_model_id);
      if (!model) return null;
      const bd = r.score_breakdown || {};
      return {
        result: r,
        model,
        fit: r.personal_fit,
        factors: bd.factors || {},
        penalties: bd.penalties || [],
        bonuses: bd.bonuses || [],
        positives: r.positive_factors || [],
        negatives: r.negative_factors || [],
        rank: r.rank,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank);
}

// Create or update the user's selection of a business (no payment, no locking).
export async function selectBusiness(user, match) {
  const own = await base44.entities.SelectedBusiness.list('-created_date', 20);
  const payload = {
    user_id: user.id,
    business_model_id: match.model.id,
    match_result_id: match.result.id,
    status: 'selected',
    selected_at: new Date().toISOString(),
  };
  const existing = (own || []).find((s) => s.business_model_id === match.model.id);
  if (existing) {
    return base44.entities.SelectedBusiness.update(existing.id, payload);
  }
  return base44.entities.SelectedBusiness.create(payload);
}