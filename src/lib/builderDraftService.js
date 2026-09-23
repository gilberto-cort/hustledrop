import { base44 } from '@/api/base44Client';

// Builder in-progress state persistence. One BuilderDraft record per selected
// business holds the user's unfinished answers, selections, typed text and
// last mission viewed — deliberately separate from GeneratedAsset records so
// autosaving can never touch module content drafts, accepted versions,
// entitlements or XP.

export async function loadBuilderDraftRecord(selectedBusinessId) {
  if (!selectedBusinessId) return null;
  try {
    const rows = await base44.entities.BuilderDraft.filter(
      { selected_business_id: selectedBusinessId },
      '-updated_date',
      5
    );
    return (rows && rows[0]) || null;
  } catch (e) {
    // Restore is best-effort — a failed read never blocks the builder.
    return null;
  }
}

export async function saveBuilderDraft(record, selectedBusinessId, userId, patch) {
  if (record) return base44.entities.BuilderDraft.update(record.id, patch);
  return base44.entities.BuilderDraft.create({
    user_id: userId,
    selected_business_id: selectedBusinessId,
    ...patch,
  });
}