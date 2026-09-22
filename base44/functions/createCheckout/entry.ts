import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import {
  findEntitlement, PURCHASE_PRODUCT, PURCHASE_AMOUNT_USD, stripeGet,
} from '../../shared/entitlement.js';
import { getAppOrigin } from '../../shared/appOrigin.js';

// CREATE CHECKOUT — starts the $19 one-time "Build My Business" purchase for
// the caller's latest selected business. Requires an authenticated user (the
// entitlement belongs to the account). Double-payment protection: an existing
// completed purchase never charges again, and an open session is reused.

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Explicitly user-scoped — server-side SDK clients bypass RLS, so the
    // caller must never be handed another user's selection.
    const selections = await base44.entities.SelectedBusiness.filter({ user_id: user.id }, '-created_date', 10);
    const selection = selections && selections[0];
    if (!selection) return Response.json({ status: 'no_selection' });

    // DOUBLE PAYMENT PROTECTION — already unlocked, never charge again.
    const owned = await findEntitlement(base44, selection.id, user.id);
    if (owned) return Response.json({ status: 'already_entitled' });

    const svc = base44.asServiceRole;

    // Reuse a still-open checkout session for the same pending purchase.
    // Service-role lookup (purchases are service-role written); scoped to
    // the caller so one user can never reuse another's session.
    const pendingRows = await svc.entities.Purchase.filter(
      { selected_business_id: selection.id, status: 'pending', user_id: user.id },
      '-created_date',
      5
    );
    const pending = (pendingRows || [])[0] || null;
    let reuseSession = null;
    if (pending && pending.provider_checkout_id) {
      reuseSession = await stripeGetSafe(`/v1/checkout/sessions/${pending.provider_checkout_id}`);
      const reuseOrigin = getAppOrigin(req);
      const reusable =
        reuseSession && !reuseSession.error && reuseSession.status === 'open' && reuseSession.url &&
        typeof reuseSession.success_url === 'string' &&
        (!reuseOrigin || reuseSession.success_url.startsWith(`${reuseOrigin}/`));
      if (reusable) {
        return Response.json({ status: 'checkout_started', url: reuseSession.url, reused: true });
      }
      // An open session that points at an outdated origin is never reused — a
      // fresh session is created below so the return always lands on this app.
    }

    // Book the pending purchase BEFORE the session so the session can carry
    // its id in metadata (fulfillment is keyed on it). Purchase writes are
    // service-role only — users can never forge a purchase client-side.
    const purchase = pending
      ? await svc.entities.Purchase.update(pending.id, { provider_checkout_id: null })
      : await svc.entities.Purchase.create({
          user_id: user.id,
          product_key: PURCHASE_PRODUCT,
          amount: PURCHASE_AMOUNT_USD,
          currency: 'usd',
          payment_provider: 'stripe',
          status: 'pending',
          selected_business_id: selection.id,
        });

    let model = null;
    try {
      model = await base44.entities.BusinessModel.get(selection.business_model_id);
    } catch (e) {
      model = null;
    }

    // Success/cancel URLs are derived from the incoming request — the origin
    // the user is actually browsing (current deployment URL or a future custom
    // domain). If it can't be derived, fail loudly instead of redirecting the
    // user to a dead app.
    const appOrigin = getAppOrigin(req);
    if (!appOrigin) {
      console.log('createCheckout error: could not derive app origin from request');
      return Response.json({ status: 'checkout_error' }, { status: 500 });
    }
    const appId = secrets.get('BASE44_APP_ID') || Deno.env.get('BASE44_APP_ID') || '';
    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('success_url', `${appOrigin}/build?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
    params.set('cancel_url', `${appOrigin}/build?checkout=cancelled`);
    params.set('client_reference_id', user.id);
    if (user.email) params.set('customer_email', user.email);
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', 'usd');
    params.set('line_items[0][price_data][unit_amount]', String(PURCHASE_AMOUNT_USD));
    params.set('line_items[0][price_data][product_data][name]', `Build My Business — ${(model && model.name) || 'Your HustleDrop Business'}`);
    params.set('metadata[base44_app_id]', String(appId));
    params.set('metadata[purchase_id]', purchase.id);
    params.set('metadata[user_id]', user.id);
    params.set('metadata[selected_business_id]', selection.id);
    params.set('metadata[product_key]', PURCHASE_PRODUCT);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secrets.get('STRIPE_SECRET_KEY')}`,
        'Stripe-Version': '2025-10-29.clover',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: params.toString(),
    });
    const session = await res.json();
    if (!res.ok) {
      console.log('createCheckout stripe_error:', session && session.error && session.error.message);
      return Response.json({ status: 'checkout_error' }, { status: 502 });
    }

    await svc.entities.Purchase.update(purchase.id, { provider_checkout_id: session.id });
    return Response.json({ status: 'checkout_started', url: session.url });
  } catch (error) {
    console.log('createCheckout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

async function stripeGetSafe(path) {
  try {
    return await stripeGet(secrets, path);
  } catch (e) {
    console.log('createCheckout session_reuse_error:', e.message);
    return null;
  }
}