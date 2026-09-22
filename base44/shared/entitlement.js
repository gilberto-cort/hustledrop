// SHARED ENTITLEMENT LOGIC — used by createCheckout, verifyCheckout,
// handlePayment (webhook) and the generation gates. A purchase is only ever
// fulfilled from verified Stripe data, idempotently: only a pending purchase
// can become completed, so replayed webhooks or double verifications can
// never double-fulfill. Refunds revoke generation but never delete content.

export const PURCHASE_PRODUCT = 'build_my_business';
export const PURCHASE_AMOUNT_USD = 1900; // cents — $19 one-time

// Active entitlement = a completed purchase for this selected business.
// userId scopes the lookup to the caller — server-side SDK clients bypass
// RLS, so ownership must be enforced explicitly, never implicitly.
export async function findEntitlement(client, selectedBusinessId, userId) {
  if (!selectedBusinessId) return null;
  const query = { selected_business_id: selectedBusinessId, status: 'completed' };
  if (userId) query.user_id = userId;
  const rows = await client.entities.Purchase.filter(query, '-created_date', 5);
  return (rows || [])[0] || null;
}

// Idempotent fulfillment: pending → completed only.
export async function fulfillPurchase(serviceClient, purchase, opts = {}) {
  if (!purchase) return { status: 'not_found' };
  if (purchase.status === 'completed') return { status: 'already_fulfilled', purchase };
  if (purchase.status !== 'pending') return { status: purchase.status, purchase };
  const updated = await serviceClient.entities.Purchase.update(purchase.id, {
    status: 'completed',
    provider_transaction_id: opts.provider_transaction_id || purchase.provider_transaction_id || null,
  });
  return { status: 'fulfilled', purchase: updated };
}

// Refund: completed → refunded. Content is never deleted; only NEW paid
// generation is blocked (findEntitlement no longer matches).
export async function refundPurchase(serviceClient, purchase) {
  if (!purchase) return { status: 'not_found' };
  if (purchase.status === 'refunded') return { status: 'already_refunded', purchase };
  if (purchase.status !== 'completed') return { status: purchase.status, purchase };
  const updated = await serviceClient.entities.Purchase.update(purchase.id, { status: 'refunded' });
  return { status: 'refunded', purchase: updated };
}

// Find the purchase tied to a Stripe id (checkout session or payment intent).
export async function findPurchaseByStripeId(serviceClient, stripeId) {
  if (!stripeId) return null;
  const bySession = await serviceClient.entities.Purchase.filter(
    { provider_checkout_id: stripeId },
    '-created_date',
    10
  );
  if (bySession && bySession.length > 0) return bySession[0];
  const byTx = await serviceClient.entities.Purchase.filter(
    { provider_transaction_id: stripeId },
    '-created_date',
    10
  );
  if (byTx && byTx.length > 0) return byTx[0];
  return null;
}

// Stripe REST helper — web-standard fetch, secret stays server-side.
export async function stripeGet(secrets, path) {
  const res = await fetch(`https://api.stripe.com${path}`, {
    headers: {
      Authorization: `Bearer ${secrets.get('STRIPE_SECRET_KEY')}`,
      'Stripe-Version': '2025-10-29.clover',
    },
  });
  return res.json();
}