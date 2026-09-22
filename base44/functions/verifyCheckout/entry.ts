import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { fulfillPurchase, findPurchaseByStripeId, stripeGet } from '../../shared/entitlement.js';

// VERIFY CHECKOUT — runs when the user returns to /build after Stripe
// checkout. NEVER trusts the success URL: the session is re-fetched from
// Stripe and the purchase is only fulfilled when Stripe says payment_status
// is 'paid'. Fulfillment is idempotent — replaying this can't double-unlock.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sessionId = String(body.session_id || '');
    if (!sessionId.startsWith('cs_')) {
      return Response.json({ status: 'invalid_session' }, { status: 400 });
    }

    const session = await stripeGet(secrets, `/v1/checkout/sessions/${sessionId}`);
    if (session.error) {
      console.log('verifyCheckout not_found:', session.error.message);
      return Response.json({ status: 'not_found' });
    }
    // The purchase must belong to the caller.
    if (session.metadata && session.metadata.user_id && session.metadata.user_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const svc = base44.asServiceRole;
    if (session.payment_status === 'paid') {
      let purchase = await findPurchaseByStripeId(svc, session.id);
      if (!purchase && session.metadata && session.metadata.purchase_id) {
        try {
          purchase = await svc.entities.Purchase.get(session.metadata.purchase_id);
        } catch (e) {
          purchase = null;
        }
      }
      if (purchase && purchase.user_id !== user.id) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const out = await fulfillPurchase(svc, purchase, {
        provider_transaction_id: session.payment_intent || null,
      });
      return Response.json({ status: 'paid', purchase_status: out.purchase ? out.purchase.status : null });
    }

    if (session.status === 'expired') {
      const purchase = await findPurchaseByStripeId(svc, session.id);
      if (purchase && purchase.status === 'pending') {
        await svc.entities.Purchase.update(purchase.id, { status: 'failed' });
      }
      return Response.json({ status: 'failed' });
    }

    // Still open / processing — webhook + return-verify will confirm it.
    return Response.json({ status: 'processing' });
  } catch (error) {
    console.log('verifyCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}