import { base44 } from '@/api/base44Client';

// Create or update the user's selection of a business (no payment, no locking).
// Matching itself runs server-side in the matchEngine backend function.
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