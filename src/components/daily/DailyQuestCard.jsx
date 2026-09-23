import React, { useMemo, useState } from 'react';
import { Sunrise, Flame, Swords, RefreshCw } from 'lucide-react';
import { DAILY_XP, BOSS_XP, BOSS_TARGET, dailyActionTarget } from '@/lib/dailyQuestService';
import { bestCustomerSegment } from '@/lib/launchService';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function missionHint(key, accepted) {
  const seg = bestCustomerSegment((accepted || {}).customer);
  switch (key) {
    case 'find_prospect':
      return seg && seg.where_to_find ? `WHERE TO LOOK: ${seg.where_to_find}` : 'Someone who fits your ideal customer — a name is all we need.';
    case 'outreach':
      return 'Your DM or email script is in your LOADOUT — send it, then tap.';
    case 'conversation':
      return 'A real back-and-forth counts — questions, answers, interest.';
    case 'follow_up':
      return 'Your follow-up script is in your LOADOUT — warm contacts reply more.';
    case 'advance_lead':
      return 'They already showed interest — respond while it is warm.';
    case 'prep':
      return 'Review what your market told you and plan a smarter angle.';
    default:
      return null;
  }
}

// TODAY'S QUEST — one persistent, bottleneck-driven mission per local day
// with a single large first-person action. The action ALWAYS runs through
// the existing record system (quick-add contact, prospect advance, or a
// self-attested prep tap) — +25 XP settles inside those services and undo
// reverses it. Loading, error, moved-on and completed states included.
export default function DailyQuestCard({ daily, loading, error, prospects, accepted, busy, onAction, onRetry }) {
  const [confirming, setConfirming] = useState(false);
  const target = useMemo(
    () => (daily && !daily.completed ? dailyActionTarget(daily.row.mission_key, prospects) : null),
    [daily, prospects]
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
        <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-white/10 motion-reduce:animate-none" />
        <div className="mt-4 h-12 animate-pulse rounded-full bg-white/5 motion-reduce:animate-none" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-center">
        <p className="text-xs text-foreground/90">Couldn't load today's quest — nothing was lost.</p>
        <button
          onClick={onRetry}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40"
        >
          <RefreshCw className="h-3 w-3" /> RETRY
        </button>
      </div>
    );
  }

  if (!daily) return null;

  const mission = daily.mission || {};
  const hint = missionHint(daily.row.mission_key, accepted);
  const bossPct = Math.min(100, Math.round((daily.weekDone / BOSS_TARGET) * 100));

  const handlePrimary = () => {
    if (!target || busy) return;
    if (target.nextStatus === 'customer') {
      setConfirming(true); // recording a sale always confirms explicitly
      return;
    }
    onAction(target);
  };

  return (
    <div className="rounded-2xl border-gradient glow-primary p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">
          <Sunrise className="h-3.5 w-3.5 text-primary" />
          TODAY'S QUEST
        </span>
        <div className="flex items-center gap-2">
          {daily.streak > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[10px] font-bold text-foreground">
              <Flame className="h-3 w-3 text-accent" />
              {daily.streak} DAY STREAK
            </span>
          )}
          <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-bold text-primary">
            +{DAILY_XP} XP
          </span>
        </div>
      </div>

      <h3 className="mt-3 text-lg font-bold tracking-tight text-foreground">{mission.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{mission.why}</p>
      {hint && <p className="mt-2 text-[11px] leading-relaxed text-foreground/80">{hint}</p>}
      {target && target.prospect && (
        <p className="mt-2 font-mono text-[10px] font-bold tracking-wider text-primary">
          TODAY'S CONTACT: {(target.prospect.name_or_alias || 'UNNAMED CONTACT').toUpperCase()}
        </p>
      )}

      {daily.completed ? (
        <div className="mt-4 rounded-full border border-primary/40 bg-brand-gradient-soft px-3 py-2.5 text-center font-mono text-[10px] font-bold tracking-widest text-primary">
          COMPLETE — SEE YOU TOMORROW
        </div>
      ) : target ? (
        <button
          onClick={handlePrimary}
          disabled={busy}
          className="mt-4 w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40 motion-reduce:transition-none"
        >
          {busy ? 'SAVING…' : mission.cta}
        </button>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-white/20 p-3 text-center">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Today's contact moved on — refresh to pick today's next real action.
          </p>
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-1.5 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40"
          >
            <RefreshCw className="h-3 w-3" /> REFRESH QUEST
          </button>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="flex items-center justify-between font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Swords className="h-3 w-3 text-accent" />
            WEEKLY BOSS — {BOSS_TARGET} DAILY QUESTS
          </span>
          <span className={daily.bossDefeated ? 'text-primary' : ''}>
            {daily.bossDefeated ? `DEFEATED +${BOSS_XP} XP` : `${daily.weekDone}/${BOSS_TARGET}`}
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 motion-reduce:transition-none ${
              daily.bossDefeated ? 'bg-primary' : 'bg-brand-gradient'
            }`}
            style={{ width: `${daily.bossDefeated ? 100 : bossPct}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        One quest per day · a missed day won't break your streak (one rest day per run) · XP tracks real actions only
        and has no monetary value.
      </p>

      <Dialog open={confirming} onOpenChange={(o) => !o && setConfirming(false)}>
        <DialogContent className="max-w-md border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">I LANDED THIS CUSTOMER</DialogTitle>
            <DialogDescription className="text-[11px] leading-relaxed">
              Only confirm a REAL sale —{' '}
              {target && target.prospect ? target.prospect.name_or_alias || 'this contact' : 'this contact'} actually
              paid or committed to pay.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs leading-relaxed text-foreground/80">
            This records a customer win through your existing pipeline. If you tapped by mistake, undo it right after
            from your quest screen.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)} className="rounded-full border-white/15">
              CANCEL
            </Button>
            <Button
              onClick={() => {
                setConfirming(false);
                onAction(target);
              }}
              disabled={busy}
              className="rounded-full bg-brand-gradient font-bold tracking-wider text-white hover:opacity-90"
            >
              {busy ? 'SAVING…' : "IT'S REAL — RECORD IT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}