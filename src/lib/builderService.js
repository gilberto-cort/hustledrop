import { base44 } from '@/api/base44Client';

// Business Builder client service. All user data, progress and entitlements
// live in deterministic records; generation runs server-side one module at a
// time. A future payment gate plugs into builderGenerate — nothing here needs
// to change.

export const BUILDER_MODULES = [
  { key: 'customer', num: '01', label: 'CUSTOMER', desc: 'Realistic customer segments to test — hypotheses, not verified demand.' },
  { key: 'offer', num: '02', label: 'OFFER', desc: 'Three offer concepts built around your accepted customer.' },
  { key: 'pricing', num: '03', label: 'PRICING', desc: 'A starting pricing hypothesis to test with real customers.' },
  { key: 'brand', num: '04', label: 'BRAND', desc: 'Name options first — then your full identity kit.' },
  { key: 'sales', num: '05', label: 'SALES', desc: 'A first-customer sales kit adapted to your sales comfort.' },
  { key: 'marketing', num: '06', label: 'MARKETING', desc: 'A small launch marketing kit for the right channels.' },
  { key: 'launch', num: '07', label: 'LAUNCH', desc: 'A 7-day validation sprint that fits your hours and budget.' },
];

export async function loadBuilderState() {
  const selections = await base44.entities.SelectedBusiness.list('-created_date', 10);
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

// One module per AI request — never the whole builder.
export async function generateModule(module_type, options = {}) {
  const res = await base44.functions.invoke('builderGenerate', { module_type, options });
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

// Ask HustleDrop — advisory only, never modifies content.
export async function askHustleDrop(question) {
  const res = await base44.functions.invoke('builderAsk', { question });
  return res.data;
}