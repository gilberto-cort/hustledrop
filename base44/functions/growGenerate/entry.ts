import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { loadBuilderContext } from '../../shared/builderContext.js';
import { GROW_PROMPTS, GROW_MISSION_KEYS } from '../../shared/growPrompts.js';

// GROW GENERATION — one mission content piece per request (cost control).
// Saves the generated draft onto the caller's own GrowMission record; the
// user accepts/edits it in the Grow UI. Never touches Personal Fit,
// HustleDNA scores, accepted Build modules or customer records.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mission_type = String(body.mission_type || '');
    if (!GROW_MISSION_KEYS.includes(mission_type)) {
      return Response.json({ error: 'invalid_mission' }, { status: 400 });
    }

    const loaded = await loadBuilderContext(base44, null);
    if (loaded.error) return Response.json({ status: loaded.error });

    // Real launch records for personalization (user-scoped).
    const quests = await base44.entities.LaunchQuest.list('-created_date', 1);
    const quest = quests && quests[0];
    if (!quest) return Response.json({ status: 'no_quest' });

    const [prospects, wins, growMissions] = await Promise.all([
      base44.entities.Prospect.filter({ launch_quest_id: quest.id }, '-created_date', 200),
      base44.entities.CustomerWin.filter({ launch_quest_id: quest.id }, '-created_date', 100),
      base44.entities.GrowMission.filter({ launch_quest_id: quest.id }, '-created_date', 50),
    ]);
    const mission = (growMissions || []).find((m) => m.mission_type === mission_type);
    if (!mission) return Response.json({ status: 'mission_not_found' });

    const byStatus = (arr, statuses) => (arr || []).filter((x) => statuses.includes(x.status)).length;
    const ctx = {
      ...loaded.context,
      grow_progress: {
        prospects: (prospects || []).length,
        outreach_sent: byStatus(prospects, ['contacted', 'conversation', 'followed_up', 'lead', 'customer']),
        conversations: byStatus(prospects, ['conversation', 'followed_up', 'lead', 'customer']),
        leads: byStatus(prospects, ['lead', 'customer']),
        customers: (wins || []).length,
        customer_records: (wins || []).map((w) => ({
          offer: w.offer_name || undefined,
          source: w.acquisition_channel || undefined,
          repeat: w.repeat_customer || undefined,
        })),
        mission_inputs: mission.inputs || {},
      },
    };

    const spec = GROW_PROMPTS[mission_type](ctx, body.options || {});
    let content;
    try {
      content = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: spec.prompt,
        response_json_schema: spec.schema,
      });
    } catch (e) {
      return Response.json({ status: 'generation_error', error: e.message });
    }

    const updated = await base44.entities.GrowMission.update(mission.id, { content });
    return Response.json({ status: 'ok', mission: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}