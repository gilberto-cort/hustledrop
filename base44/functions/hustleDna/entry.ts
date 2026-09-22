import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { computeDna } from '../../shared/hustleDnaEngine.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    // ---------- ADMIN-ONLY TEST MODE ----------
    // Runs the deterministic DNA engine on a temporary profile. Nothing is
    // saved and the admin's real profile / DNA record is never touched.
    if (body && body.test_profile) {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      return Response.json({ status: 'ok', mode: 'test', dna: computeDna(body.test_profile) });
    }

    // ---------- REAL DNA RUN ----------
    // Derives HustleDNA from the caller's existing HustleMatch answers
    // (explicitly user-scoped — server-side SDK clients bypass RLS).
    const profiles = await base44.entities.HustleProfile.filter({ user_id: user.id }, '-created_date', 5);
    const profile = profiles && profiles[0];
    if (!profile || !profile.profile_complete) {
      return Response.json({ status: 'no_profile' });
    }

    const dna = computeDna(profile);

    const payload = {
      user_id: profile.user_id || user.id,
      hustler_score: dna.scores.hustler,
      digital_builder_score: dna.scores.digital_builder,
      creator_score: dna.scores.creator,
      connector_score: dna.scores.connector,
      operator_score: dna.scores.operator,
      builder_score: dna.scores.builder,
      primary_type: dna.primary_type,
      secondary_type: dna.secondary_type,
      supporting_type: dna.supporting_type,
      hustle_code: dna.hustle_code,
      revenue_tempo: dna.dimensions.revenue_tempo,
      work_mode: dna.dimensions.work_mode,
      social_energy: dna.dimensions.social_energy,
      growth_style: dna.dimensions.growth_style,
      selling_style: dna.dimensions.selling_style,
      risk_approach: dna.dimensions.risk_approach,
      strengths: dna.strengths,
      traps: dna.traps,
    };

    const existing = await base44.entities.HustleDNAProfile.filter({ user_id: user.id }, '-created_date', 5);
    let created = true;
    if (existing && existing[0]) {
      await base44.entities.HustleDNAProfile.update(existing[0].id, payload);
      created = false;
    } else {
      await base44.entities.HustleDNAProfile.create(payload);
    }

    return Response.json({ status: 'ok', created, dna });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}