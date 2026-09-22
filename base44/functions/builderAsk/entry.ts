import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { loadBuilderContext } from '../../shared/builderContext.js';
import { ASK_SAFETY } from '../../shared/builderPrompts.js';
import { findEntitlement } from '../../shared/entitlement.js';

// ASK HUSTLEDROP — advisory assistant over the user's real builder state.
// It can NEVER modify content: it returns advice only, and the user applies
// changes themselves via EDIT or TRY ANOTHER.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const question = String(body.question || '').slice(0, 600).trim();
    if (!question) return Response.json({ error: 'question required' }, { status: 400 });

    const loaded = await loadBuilderContext(base44, null, user.id);
    if (loaded.error) return Response.json({ status: loaded.error });

    // ENTITLEMENT: Ask HustleDrop is part of the paid Business Builder —
    // it requires the same verified completed purchase (admins exempt).
    // Refunds revoke new advice but never delete existing content.
    if (user.role !== 'admin') {
      const entitlement = await findEntitlement(base44, loaded.selection.id, user.id);
      if (!entitlement) return Response.json({ status: 'payment_required' }, { status: 403 });
    }

    // Launch + Grow progress so advice reflects the user's real pipeline.
    // Optional — advice still works without it.
    let progressContext = null;
    try {
      const quests = await base44.entities.LaunchQuest.filter({ user_id: user.id }, '-created_date', 5);
      const quest = quests && quests[0];
      if (quest) {
        const [prospects, wins, growMissions] = await Promise.all([
          base44.entities.Prospect.filter({ launch_quest_id: quest.id }, '-created_date', 200),
          base44.entities.CustomerWin.filter({ launch_quest_id: quest.id }, '-created_date', 100),
          base44.entities.GrowMission.filter({ launch_quest_id: quest.id }, '-created_date', 50),
        ]);
        const byStatus = (arr, statuses) => (arr || []).filter((x) => statuses.includes(x.status)).length;
        progressContext = {
          launch_quest_status: quest.status,
          prospects: (prospects || []).length,
          outreach_sent: byStatus(prospects, ['contacted', 'conversation', 'followed_up', 'lead', 'customer']),
          conversations: byStatus(prospects, ['conversation', 'followed_up', 'lead', 'customer']),
          leads: byStatus(prospects, ['lead', 'customer']),
          customers: (wins || []).length,
          customer_sources: (wins || []).map((w) => w.acquisition_channel).filter(Boolean),
          grow_missions: (growMissions || []).map((m) => ({ type: m.mission_type, status: m.status })),
        };
      }
    } catch (e) {
      // progress context is optional
    }

    const prompt = `You are "Ask HustleDrop", the advisory assistant inside HustleDrop's Business Builder.

${ASK_SAFETY}

You may NOT modify any content — you give advice only. The user applies changes themselves via EDIT or TRY ANOTHER. Never promise to change anything on their behalf.

USER CONTEXT (their real data):
${JSON.stringify(loaded.context, null, 2)}

THEIR ACCEPTED BUILDER MODULES (JSON):
${JSON.stringify(loaded.accepted, null, 2)}
${progressContext ? `
THEIR LAUNCH/GROW PROGRESS (real records):
${JSON.stringify(progressContext, null, 2)}
` : ''}
USER QUESTION:
${question}

Answer helpfully, concisely and specifically to this user's business, budget, hours and HustleDNA. Plain text only, no markdown tables or code blocks.`;

    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt });
    return Response.json({
      status: 'ok',
      answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}