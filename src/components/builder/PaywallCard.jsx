import React from 'react';
import { Lock, Check, AlertCircle, Loader2 } from 'lucide-react';

const INCLUDED = [
  'CUSTOMER strategy', 'OFFER concepts', 'PRICING hypothesis', 'BRAND kit',
  'SALES scripts', 'MARKETING kit', 'LAUNCH plan',
  'Launch Loadout + Launch Mode', 'Ask HustleDrop business context', 'Persistent generated assets',
];

// BUILD MY BUSINESS — $19 one-time paywall. Reflects explicit payment states;
// nothing is unlocked here — the server verifies every payment.
export default function PaywallCard({ modelName, fit, payment, busy, onStartCheckout }) {
  const state = (payment && payment.state) || 'not_started';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-gradient p-6 text-center">
        <Lock className="mx-auto h-6 w-6 text-primary" />
        <div className="mt-3 text-xs font-semibold tracking-[0.25em] text-muted-foreground">UNLOCK THE BUSINESS BUILDER</div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-gradient">BUILD MY BUSINESS</h1>
        <p className="mt-2 text-sm text-foreground/90">{modelName}</p>
        {typeof fit === 'number' && (
          <p className="mt-1 font-mono text-[10px] font-bold tracking-wider text-muted-foreground">
            PERSONAL FIT {fit}/99
          </p>
        )}
        <div className="mt-4 font-mono text-3xl font-bold text-foreground">$19</div>
        <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">ONE-TIME — NOT A SUBSCRIPTION</div>
        <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-muted-foreground">
          HustleDrop builds this business WITH you — every module personalized to your HustleMatch, budget,
          hours and HustleDNA. Regenerating modules for this same business never charges again.
        </p>

        {state === 'processing' ? (
          <div className="mt-5 rounded-xl border border-primary/30 bg-brand-gradient-soft p-4">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              PAYMENT PROCESSING
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/90">
              We're confirming your payment. Your Business Builder will unlock automatically when confirmation
              is received — you can safely refresh this page.
            </p>
          </div>
        ) : (state === 'failed' || state === 'cancelled') ? (
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
              <AlertCircle className="h-4 w-4 text-destructive" />
              PAYMENT NOT COMPLETED
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/90">
              No charge was successfully confirmed. Your Match and HustleDNA are safe.
            </p>
            <button
              onClick={onStartCheckout}
              disabled={busy}
              className="mt-3 w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-50"
            >
              TRY AGAIN
            </button>
          </div>
        ) : state === 'iframe_blocked' ? (
          <div className="mt-5 rounded-xl border border-white/15 bg-white/[0.02] p-4">
            <p className="text-xs leading-relaxed text-foreground/90">
              Checkout works only from the published app — open the app in its own tab to purchase.
            </p>
          </div>
        ) : (
          <button
            onClick={onStartCheckout}
            disabled={busy}
            className="mt-5 w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
          >
            {busy ? 'STARTING CHECKOUT…' : 'BUILD MY BUSINESS — $19'}
          </button>
        )}

        {state === 'not_started' && (
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Secure checkout via Stripe. Nothing is unlocked until payment is confirmed on our servers.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground">WHAT'S INCLUDED</div>
        <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-foreground/90">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
          One purchase unlocks the Builder for this selected business. Your free HustleDNA and matches always
          stay yours.
        </p>
      </div>
    </div>
  );
}