import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { loadBuilderContext } from '../../shared/builderContext.js';
import { ASK_SAFETY } from '../../shared/builderPrompts.js';

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

    const loaded = await loadBuilderContext(base44, null);
    if (loaded.error) return Response.json({ status: loaded.error });

    const prompt = `You are "Ask HustleDrop", the advisory assistant inside HustleDrop's Business Builder.

${ASK_SAFETY}

You may NOT modify any content — you give advice only. The user applies changes themselves via EDIT or TRY ANOTHER. Never promise to change anything on their behalf.

USER CONTEXT (their real data):
${JSON.stringify(loaded.context, null, 2)}

THEIR ACCEPTED BUILDER MODULES (JSON):
${JSON.stringify(loaded.accepted, null, 2)}

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