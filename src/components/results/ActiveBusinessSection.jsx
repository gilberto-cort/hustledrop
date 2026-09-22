import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowLeftRight, Lock, ShieldCheck } from 'lucide-react';

// YOUR ACTIVE BUSINESS — the business the user is currently working on,
// kept explicitly SEPARATE from the latest match set shown above it.
// LatestMatchSet, ActiveSelectedBusiness and PurchasedBusinessEntitlements
// are three different things and are never blended here:
// - switching to a NEW latest #1 discloses when a $19 unlock applies;
// - switching back to an already-paid business is always free and
//   re-activates the same purchased record (never a second charge).
export default function ActiveBusinessSection({
  activeName,
  activeIsLatest,
  latestMatch,
  latestIsPurchased,
  otherPurchased,
  busy,
  onSelectLatest,
  onSwitchBusiness,
}) {
  const navigate = useNavigate();
  return (
    <section className="rounded-2xl border-2 border-primary/40 bg-brand-gradient-soft p-6 text-center glow-primary">
      <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
      <div className="mt-3 text-xs font-semibold tracking-[0.25em] text-muted-foreground">YOUR ACTIVE BUSINESS</div>
      <h2 className="mt-1 text-xl font-semibold text-foreground">{activeName}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        This is the business you're building. Your latest match results above are separate — switching is always your
        choice.
      </p>
      <div className="mt-5 space-y-2.5">
        <Button
          onClick={() => navigate('/build')}
          className="w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white"
        >
          CONTINUE BUILDING
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="w-full rounded-full py-2.5 text-xs font-semibold tracking-wider"
        >
          VIEW MY DASHBOARD
        </Button>
      </div>

      {!activeIsLatest && latestMatch && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
            <ArrowLeftRight className="h-3 w-3" />
            NEW #1 MATCH
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Your latest results rank{' '}
            <span className="font-semibold text-foreground">{latestMatch.model.name}</span> first. Making it your
            active business starts a fresh build around it — everything you've built for {activeName} stays saved and
            untouched.
          </p>
          {latestIsPurchased ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              ALREADY UNLOCKED — SWITCHING IS FREE
            </p>
          ) : (
            <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              A ONE-TIME $19 UNLOCK APPLIES TO BUILD THIS BUSINESS
            </p>
          )}
          <Button
            onClick={onSelectLatest}
            disabled={busy}
            className="mt-3 w-full rounded-full border border-primary/40 bg-primary/10 py-2.5 text-[11px] font-bold tracking-widest text-primary hover:bg-primary/20 disabled:opacity-40"
          >
            {busy ? 'SWITCHING…' : `MAKE ${latestMatch.model.name.toUpperCase()} MY ACTIVE BUSINESS`}
          </Button>
        </div>
      )}

      {otherPurchased.length > 0 && (
        <div className="mt-3 space-y-2">
          {otherPurchased.map((b) => (
            <button
              key={b.modelId}
              onClick={() => onSwitchBusiness(b)}
              disabled={busy}
              className="w-full rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground disabled:opacity-40"
            >
              SWITCH BACK TO {b.name.toUpperCase()} — ALREADY PAID
            </button>
          ))}
        </div>
      )}
    </section>
  );
}