import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { startupRangeLabel, workModeLabel, speedLabel, positiveText, negativeText } from '@/lib/matchDisplay';

// Ranked alternate (#2 / #3): a real recommendation, not background content —
// clear card contrast, visible Personal Fit and a strong tap affordance, while
// the #1 recommendation stays dominant above.
//
// `locked` / `unlockHint` reserve the referral-gate architecture: a future
// pass will unlock #2 and #3 via qualified referrals. Nothing is locked yet and
// no referral button is rendered — the props only define where the gate goes.
export default function AltMatchCard({ match, onView, locked = false, unlockHint = null }) {
  const m = match.model;
  const reason = (match.positives || [])[0];
  const tradeoff = (match.negatives || [])[0];

  if (locked) {
    return (
      <div className="rounded-2xl border border-white/20 bg-white/[0.05] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">
              #{match.rank} HUSTLEMATCH
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{m.name}</h3>
          </div>
          <div className="shrink-0 text-right">
            <span className="font-mono text-2xl font-bold text-gradient">{match.fit}/99</span>
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">PERSONAL FIT</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/15 bg-background/60 px-3 py-2.5">
          <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-xs font-bold tracking-wider text-foreground/90">LOCKED</span>
          {unlockHint && <span className="truncate text-[11px] text-muted-foreground">{unlockHint}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 transition hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-wider text-primary">#{match.rank} HUSTLEMATCH</div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{m.name}</h3>
          <div className="mt-1 text-xs text-muted-foreground">
            {startupRangeLabel(m)} · {workModeLabel(m)} · {speedLabel(m.speed_to_first_sale)}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-mono text-2xl font-bold text-gradient">{match.fit}/99</span>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">PERSONAL FIT</div>
        </div>
      </div>
      {reason && <p className="mt-3 text-xs text-foreground/85">✓ {positiveText(reason)}</p>}
      {tradeoff && <p className="mt-1.5 text-xs text-muted-foreground">– {negativeText(tradeoff)}</p>}
      <Button onClick={onView} variant="outline" className="mt-4 w-full rounded-full py-2.5 text-xs font-semibold">
        VIEW MATCH
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}