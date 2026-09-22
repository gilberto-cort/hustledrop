import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import {
  fulfillPurchase, refundPurchase, findPurchaseByStripeId, stripeGet,
} from '../../shared/entitlement.js';

// HANDLE PAYMENT — invoked by the "On Payment" workflow (app_payment
// trigger: payment_succeeded / payment_refunded). This endpoint is reachable
// without user auth, so NOTHING is trusted from the request: every transition
// is re-verified against Stripe before any purchase changes state, and
// fulfillment itself is idempotent (pending → completed once, ever).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const eventType = String(body.event_type || '');
    const stripeId = String(body.provider_transaction_id || '');

    if (eventType === 'payment_succeeded') {
      if (!stripeId) return Response.json({ status: 'invalid_payload' });
      // Re-verify with Stripe before fulfilling — never trust the caller.
      let purchase = null;
      if (stripeId.startsWith('cs_')) {
        const session = await stripeGet(secrets, `/v1/checkout/sessions/${stripeId}`);
        if (session.error) return Response.json({ status: 'session_not_found' });
        if (session.payment_status !== 'paid') {
          return Response.json({ status: 'not_paid', payment_status: session.payment_status });
        }
        purchase = await findPurchaseByStripeId(svc, session.id);
        if (!purchase && session.metadata && session.metadata.purchase_id) {
          try {
            purchase = await svc.entities.Purchase.get(session.metadata.purchase_id);
          } catch (e) {
            purchase = null;
          }
        }
        const out = await fulfillPurchase(svc, purchase, {
          provider_transaction_id: session.payment_intent || null,
        });
        return Response.json({ status: out.status });
      }
      if (stripeId.startsWith('pi_')) {
        const intent = await stripeGet(secrets, `/v1/payment_intents/${stripeId}`);
        if (intent.error) return Response.json({ status: 'intent_not_found' });
        if (intent.status !== 'succeeded') {
          return Response.json({ status: 'not_paid', intent_status: intent.status });
        }
        purchase = await findPurchaseByStripeId(svc, stripeId);
        const out = await fulfillPurchase(svc, purchase);
        return Response.json({ status: out.status });
      }
      return Response.json({ status: 'unsupported_id' });
    }

    if (eventType === 'payment_refunded') {
      if (!stripeId) return Response.json({ status: 'invalid_payload' });
      // Refunds arrive with a CHARGE id — retrieve it to find the payment
      // intent the purchase was fulfilled under.
      const charge = await stripeGet(secrets, `/v1/charges/${stripeId}`);
      if (charge.error) return Response.json({ status: 'charge_not_found' });
      if (!charge.refunded) return Response.json({ status: 'not_refunded' });
      const purchase = await findPurchaseByStripeId(svc, charge.payment_intent || stripeId);
      const out = await refundPurchase(svc, purchase);
      return Response.json({ status: out.status });
    }

    return Response.json({ status: 'ignored_event' });
  } catch (error) {
    console.log('handlePayment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}