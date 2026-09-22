import React from 'react';
import { AlertCircle, Loader2, ArrowRight } from 'lucide-react';

// Outcomes, not internal module terminology — a beginner understands what
// they'll walk away with.
const INCLUDED = [
  ['CUSTOMER', "Know who you're selling to."],
  ['OFFER', 'Create something worth paying for.'],
  ['STARTING PRICE', 'Choose a price to begin testing.'],
  ['BRAND', 'Build your business identity.'],
  ['SALES', 'Get ready-to-use outreach messages.'],
  ['MARKETING', 'Know how to start getting attention.'],
  ['LAUNCH', 'Enter your First Customer Quest.'],
  ['SAVED', 'Your business stays saved — come back anytime.'],
];

// The game, not the documents — compact differentiation of what happens after
// the build: the business gets used, not filed away.
const GAME_STEPS = ['BUILD', 'LAUNCH', 'FIRST CUSTOMER', 'GROW'];

// BUILD MY BUSINESS — $19 one-time paywall. Reflects explicit payment states;
// nothing is unlocked here — the server verifies every payment.
export default function PaywallCard({ modelName, fit, payment, busy, onStartCheckout }) {
  const state = (payment && payment.state) || 'not_started';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-gradient p-6 text-center">
        <div className="text-[10px] font-semibold tracking-[0.25em] text-muted-foreground">UNLOCK THE BUSINESS BUILDER</div>
        <h1 className="mx-auto mt-3 max-w-md text-xl font-bold leading-snug tracking-tight text-gradient sm:text-2xl">
          TURN YOUR MATCH INTO A BUSINESS YOU CAN ACTUALLY LAUNCH
        </h1>
        <p className="mx-auto mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
          We'll help you figure out who to sell to, what to offer, what to charge, what to call your business, how to
          pitch it, and what to do to find your first customer.
        </p>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{modelName}</p>
          {typeof fit === 'number' && (
            <p className="mt-0.5 font-mono text-[10px] font-bold tracking-wider text-primary">
              PERSONAL FIT {fit}/99
            </p>
          )}
        </div>

        <div className="mt-4 font-mono text-3xl font-bold text-foreground">$19</div>
        <div className="text-[10px] font-semibold tracking-widest text-muted-foreground">ONE-TIME — NOT A SUBSCRIPTION</div>
        <p className="mx-auto mt-3 max-w-sm text-[11px] leading-relaxed text-muted-foreground">
          Regenerating modules for this same business never charges again.
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
            Secure one-time checkout powered by Stripe.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground">WHAT'S INCLUDED</div>
        <ul className="mt-3 space-y-2">
          {INCLUDED.map(([k, v]) => (
            <li key={k} className="flex items-start gap-2.5 text-xs">
              <span className="mt-0.5 w-24 shrink-0 font-mono text-[10px] font-bold tracking-wider text-primary">
                {k}
              </span>
              <span className="text-foreground/90">{v}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground">THIS ISN'T ANOTHER BUSINESS PDF.</div>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-foreground/85">
          Build your business. Equip your Launch Loadout. Complete real-world quests. Earn XP. Unlock achievements.
          Get your first customer. Enter the next world.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          {GAME_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground/60" />}
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider text-foreground/90">
                {s}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}