import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Loader2 } from 'lucide-react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import AdventureStages from '@/components/game/AdventureStages';
import PreviewVisuals from '@/components/game/PreviewVisuals';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// GAME-FIRST UNLOCK SCREEN — the $19 one-time paywall for THIS selected
// business. Reflects explicit payment states; nothing is unlocked here — the
// server verifies every payment (createCheckout / verifyCheckout / the On
// Payment workflow), and no CTA is shown while a confirmed payment is being
// reconciled.
export default function PaywallCard({ modelName, fit, dna, payment, busy, onStartCheckout, onRetryVerify }) {
  const state = (payment && payment.state) || 'not_started';
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (!dna) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        if (!cancelled && me && me.selected_avatar_id) {
          setAvatar(await base44.entities.Avatar.get(me.selected_avatar_id));
        }
      } catch (e) {
        // cosmetic — the labelled fallback slot covers it
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dna ? dna.id : null]);

  const primary = dna ? DNA_TYPES[dna.primary_type] : null;
  const secondary = dna && dna.secondary_type ? DNA_TYPES[dna.secondary_type] : null;

  return (
    <div className="space-y-4">
      {/* HERO — compact: one line of quest framing plus the user's REAL
          business identity and character. Never hardcoded examples. */}
      <div className="rounded-2xl border-gradient px-5 py-5 text-center">
        <h1 className="text-lg font-bold tracking-tight text-gradient sm:text-xl">YOUR BUSINESS. YOUR QUEST.</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">
          You've discovered your match. Now turn it into something real.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-left">
          <SpriteDisplay avatar={avatar} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{modelName || 'Your business'}</p>
            {typeof fit === 'number' && (
              <p className="font-mono text-[10px] font-bold tracking-wider text-primary">PERSONAL FIT {fit}/99</p>
            )}
            {primary && (
              <p className={`mt-0.5 font-mono text-[10px] font-bold tracking-wider ${primary.accent}`}>
                {primary.label}
                {secondary ? ` + ${secondary.label}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {state === 'verifying' ? (
        <div className="rounded-2xl border border-primary/30 bg-brand-gradient-soft p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold tracking-wider text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            VERIFYING YOUR PURCHASE
          </div>
          <p className="mt-2 text-xs leading-relaxed text-foreground/90">
            We're confirming your payment and unlocking your Builder — you don't need to do anything. You can safely
            refresh this page.
          </p>
        </div>
      ) : state === 'processing' ? (
        <div className="rounded-2xl border border-primary/30 bg-brand-gradient-soft p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold tracking-wider text-primary">
            <AlertCircle className="h-4 w-4" />
            PAYMENT NEEDS ATTENTION
          </div>
          <p className="mt-2 text-xs leading-relaxed text-foreground/90">
            Your payment is still being confirmed. We won't ask you to pay again while this is being reconciled — if
            it keeps failing, contact support.
          </p>
          <button
            onClick={onRetryVerify}
            className="mt-3 w-full rounded-full border border-primary/40 py-2.5 text-xs font-bold tracking-widest text-primary transition hover:bg-primary/10"
          >
            CHECK AGAIN
          </button>
        </div>
      ) : state === 'failed' || state === 'cancelled' ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-bold tracking-wider text-foreground">
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
      ) : null}

      <AdventureStages />
      <PreviewVisuals />

      <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-5 text-center">
        <div className="font-mono text-3xl font-bold text-foreground">$19</div>
        <div className="mt-0.5 font-mono text-[10px] font-bold tracking-widest text-primary">
          ONE-TIME — FOR THIS SELECTED BUSINESS
        </div>
        <p className="mx-auto mt-3 max-w-sm text-[11px] leading-relaxed text-foreground/85">
          Unlocks the full Builder for {modelName || 'this business'}: your customer profile, offer, pricing, brand and
          sales kit — then a guided quest map toward your first customer.
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-[10px] leading-relaxed text-muted-foreground">
          One-time purchase, not a subscription. Regenerate and edit modules for this same business as you build.
          Unlocking a different business later is a separate purchase.
        </p>

        {state === 'iframe_blocked' ? (
          <p className="mt-4 rounded-xl border border-white/15 bg-white/[0.02] p-3 text-xs leading-relaxed text-foreground/90">
            Checkout works only from the published app — open the app in its own tab to purchase.
          </p>
        ) : state === 'not_started' ? (
          <>
            <button
              onClick={onStartCheckout}
              disabled={busy}
              className="mt-4 w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
            >
              {busy ? 'STARTING CHECKOUT…' : 'UNLOCK MY BUSINESS ADVENTURE'}
            </button>
            <p className="mt-2.5 text-[10px] text-muted-foreground">Secure one-time checkout powered by Stripe.</p>
          </>
        ) : null}
      </div>
    </div>
  );
}