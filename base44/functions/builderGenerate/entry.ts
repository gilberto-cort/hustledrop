import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { loadBuilderContext } from '../../shared/builderContext.js';
import { MODULE_PROMPTS, BUILDER_MODULE_KEYS } from '../../shared/builderPrompts.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));

    // ---------- ADMIN TEST MODE: inspect context + generation, nothing saved ----------
    if (body && body.test_mode) {
      if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
      const module_type = body.module_type;
      if (!BUILDER_MODULE_KEYS.includes(module_type) || !body.context) {
        return Response.json({ error: 'invalid_test_payload' }, { status: 400 });
      }
      const spec = MODULE_PROMPTS[module_type](body.context, body.options || {});
      try {
        const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: spec.prompt,
          response_json_schema: spec.schema,
        });
        return Response.json({ status: 'ok', mode: 'test', module_type, content });
      } catch (e) {
        return Response.json({ status: 'generation_error', error: e.message });
      }
    }

    // ---------- REAL GENERATION: one module, one AI request (cost control) ----------
    const module_type = body.module_type;
    if (!BUILDER_MODULE_KEYS.includes(module_type)) {
      return Response.json({ error: 'invalid_module' }, { status: 400 });
    }

    // ENTITLEMENT HOOK: when payments ship, enforce the BUILD entitlement here —
    // this is the single choke point for every module generation.
    const loaded = await loadBuilderContext(base44, module_type);
    if (loaded.error) return Response.json({ status: loaded.error, missing: loaded.missing || [] });

    const options = { ...(body.options || {}) };
    if (module_type === 'brand') options.seen_names = loaded.seenBrandNames;

    const spec = MODULE_PROMPTS[module_type](loaded.context, options);
    let content;
    try {
      content = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: spec.prompt,
        response_json_schema: spec.schema,
      });
    } catch (e) {
      return Response.json({ status: 'generation_error', error: e.message });
    }

    // Persist as a NEW draft version — previous versions are never deleted or
    // overwritten (TRY ANOTHER / EDIT preserve history).
    const existing = await base44.entities.GeneratedAsset.filter(
      { selected_business_id: loaded.selection.id, module_type },
      '-created_date',
      200
    );
    const maxVersion = (existing || []).reduce((m, a) => Math.max(m, Number(a.version) || 0), 0);

    const metadata = { based_on: loaded.basedOn };
    if (module_type === 'brand') metadata.stage = (body.options && body.options.stage) || 'names';
    if (loaded.seenBrandNames && loaded.seenBrandNames.length) metadata.seen_brand_names = loaded.seenBrandNames;

    const asset = await base44.entities.GeneratedAsset.create({
      user_id: user.id,
      selected_business_id: loaded.selection.id,
      module_type,
      version: maxVersion + 1,
      content,
      status: 'draft',
      generation_metadata: metadata,
    });

    return Response.json({ status: 'ok', asset });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}