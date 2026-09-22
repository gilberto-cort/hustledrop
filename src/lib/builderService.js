import { base44 } from '@/api/base44Client';

// Business Builder client service. All user data, progress and entitlements
// live in deterministic records; generation runs server-side one module at a
// time. A future payment gate plugs into builderGenerate — nothing here needs
// to change.

// The six modules that constitute a BUILT business. Launch is no longer a
// Build module — the accepted launch plan feeds Launch Mode instead.
export const BUILD_MODULES = [
  { key: 'customer', num: '01', label: 'CUSTOMER', desc: 'Realistic customer segments to test — hypotheses, not verified demand.' },
  { key: 'offer', num: '02', label: 'OFFER', desc: 'Three offer concepts built around your accepted customer.' },
  { key: 'pricing', num: '03', label: 'PRICING', desc: 'A starting pricing hypothesis to test with real customers.' },
  { key: 'brand', num: '04', label: 'BRAND', desc: 'Name options first — then your full brand kit.' },
  { key: 'sales', num: '05', label: 'SALES', desc: 'A first-customer sales kit adapted to your sales comfort.' },
  { key: 'marketing', num: '06', label: 'MARKETING', desc: 'A small launch marketing kit for the right channels.' },
];

// All module types the server can still generate (kept for admin testing and
// legacy launch-plan assets).
export const MODULE_KEYS = ['customer', 'offer', 'pricing', 'brand', 'sales', 'marketing', 'launch'];

// Latest accepted content per module type (works for legacy and new schemas).
export function acceptedByModule(assets) {
  const map = {};
  for (const a of assets || []) {
    if (a.status !== 'accepted') continue;
    const cur = map[a.module_type];
    if (!cur || Number(a.version || 0) > Number(cur.version || 0)) map[a.module_type] = a;
  }
  const out = {};
  for (const [k, v] of Object.entries(map)) out[k] = v.content;
  return out;
}

export async function loadBuilderState() {
  // Active = most recently SELECTED (selected_at), not newest record —
  // switching back to an older paid business must make it active.
  const selections = await base44.entities.SelectedBusiness.list('-selected_at', 10);
  const selection = selections && selections[0];
  if (!selection) return { selection: null };

  const [model, matchResults, dnaRows, assets] = await Promise.all([
    base44.entities.BusinessModel.get(selection.business_model_id),
    base44.entities.MatchResult.list('-created_date', 10),
    base44.entities.HustleDNAProfile.list('-created_date', 1),
    base44.entities.GeneratedAsset.filter({ selected_business_id: selection.id }, '-created_date', 200),
  ]);
  const top = (matchResults || []).find((r) => r.rank === 1);
  return {
    selection,
    model,
    fit: top ? top.personal_fit : null,
    dna: (dnaRows && dnaRows[0]) || null,
    assets: assets || [],
  };
}

// Only these explicit, JSON-safe string fields are ever forwarded to the
// server. A stray React event or SDK object in options can never reach the
// request serializer — anything else is silently dropped.
const SAFE_OPTION_KEYS = ['tone', 'stage', 'selected_name'];

// One module per AI request — never the whole builder.
export async function generateModule(module_type, options = {}) {
  const safeOptions = {};
  if (options && typeof options === 'object' && !Array.isArray(options)) {
    for (const k of SAFE_OPTION_KEYS) {
      const v = options[k];
      if (typeof v === 'string' && v) safeOptions[k] = v;
    }
  }
  const res = await base44.functions.invoke('builderGenerate', { module_type, options: safeOptions });
  return res.data;
}

// Accept one version; archive any other accepted version of the same module.
export async function acceptAsset(asset, moduleAssets) {
  const toArchive = (moduleAssets || []).filter(
    (a) => a.module_type === asset.module_type && a.status === 'accepted' && a.id !== asset.id
  );
  if (toArchive.length > 0) {
    await base44.entities.GeneratedAsset.bulkUpdate(toArchive.map((a) => ({ id: a.id, status: 'archived' })));
  }
  return base44.entities.GeneratedAsset.update(asset.id, {
    status: 'accepted',
    accepted_at: new Date().toISOString(),
  });
}

// Editing a draft updates that draft. Editing an ACCEPTED version never
// overwrites it — the edit is saved as a NEW draft version the user must
// explicitly accept.
export async function saveEditedContent(asset, moduleAssets, content) {
  if (asset.status === 'draft') {
    const updated = await base44.entities.GeneratedAsset.update(asset.id, { content });
    return { asset: updated, created: false };
  }
  const maxVersion = (moduleAssets || []).reduce((m, a) => Math.max(m, Number(a.version) || 0), 0);
  const clone = await base44.entities.GeneratedAsset.create({
    user_id: asset.user_id,
    selected_business_id: asset.selected_business_id,
    module_type: asset.module_type,
    version: maxVersion + 1,
    content,
    status: 'draft',
    generation_metadata: {
      edited_from: asset.id,
      based_on: (asset.generation_metadata || {}).based_on || {},
    },
  });
  return { asset: clone, created: true };
}

// MANUAL MARKETING FALLBACK — when the AI kit is unavailable the user builds
// their own campaign from their accepted material. Creates a plain DRAFT the
// user explicitly accepts; it is never presented as AI-generated and previous
// versions are never touched.
export async function createManualMarketingAsset(userId, selectedBusinessId, content) {
  const existing = await base44.entities.GeneratedAsset.filter(
    { selected_business_id: selectedBusinessId, module_type: 'marketing' },
    '-created_date',
    200
  );
  const maxVersion = (existing || []).reduce((m, a) => Math.max(m, Number(a.version) || 0), 0);
  return base44.entities.GeneratedAsset.create({
    user_id: userId,
    selected_business_id: selectedBusinessId,
    module_type: 'marketing',
    version: maxVersion + 1,
    content: { ...content, manual: true },
    status: 'draft',
    generation_metadata: { manual: true },
  });
}

// Manual brand fallback — when AI naming is unavailable the user enters their
// own business name. Creates a plain DRAFT the user explicitly accepts; it is
// never presented as AI-generated and previous versions are never touched.
export async function createManualBrandAsset(userId, selectedBusinessId, name) {
  const existing = await base44.entities.GeneratedAsset.filter(
    { selected_business_id: selectedBusinessId, module_type: 'brand' },
    '-created_date',
    200
  );
  const maxVersion = (existing || []).reduce((m, a) => Math.max(m, Number(a.version) || 0), 0);
  return base44.entities.GeneratedAsset.create({
    user_id: userId,
    selected_business_id: selectedBusinessId,
    module_type: 'brand',
    version: maxVersion + 1,
    content: { chosen_name: name, manual: true },
    status: 'draft',
    generation_metadata: { manual: true },
  });
}

// Ask HustleDrop — advisory only, never modifies content.
export async function askHustleDrop(question) {
  const res = await base44.functions.invoke('builderAsk', { question });
  return res.data;
}