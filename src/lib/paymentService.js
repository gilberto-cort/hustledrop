import { base44 } from '@/api/base44Client';

// Client-side payment helpers. The server (createCheckout / verifyCheckout /
// the On Payment workflow) is the only thing that decides entitlement —
// this file just calls it and reflects state in the UI.

export const BUILD_PRICE_LABEL = '$19';

// A completed purchase for this selected business = active entitlement.
// Refunded purchases lose generation but never lose content.
export async function hasEntitlement(selectedBusinessId) {
  if (!selectedBusinessId) return false;
  const rows = await base44.entities.Purchase.filter(
    { selected_business_id: selectedBusinessId, status: 'completed' },
    '-created_date',
    1
  );
  return !!(rows && rows.length > 0);
}

// Checkout can only run from the published app, not the builder iframe.
function inPreviewIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

export async function startCheckout() {
  if (inPreviewIframe()) return { status: 'iframe_blocked' };
  const res = await base44.functions.invoke('createCheckout', {});
  return res.data;
}

export async function verifyCheckoutSession(sessionId) {
  const res = await base44.functions.invoke('verifyCheckout', { session_id: sessionId });
  return res.data;
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// VERIFY WITH BOUNDED BACKOFF — a session can still report 'processing'
// right after a successful return. Each retry re-checks server-side (the
// server re-verifies with Stripe and fulfills idempotently), so replaying
// this can never double-fulfill.
export async function verifyCheckoutWithRetry(sessionId, attempts = 3) {
  let res = await verifyCheckoutSession(sessionId);
  for (let i = 0; i < attempts && res && res.status === 'processing'; i++) {
    await delay(1500 * (i + 1));
    res = await verifyCheckoutSession(sessionId);
  }
  return res;
}