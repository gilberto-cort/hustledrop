import React from 'react';
import { Button } from '@/components/ui/button';
import { startupRangeLabel, workModeLabel, speedLabel, positiveText, negativeText } from '@/lib/matchDisplay';

// Ranked alternate (#2 / #3): name, Personal Fit, startup range, one strongest
// reason, one tradeoff, and VIEW MATCH. Never disturbs the original ranking.
export default function AltMatchCard({ match, onView }) {
  const m = match.model;
  const reason = (match.positives || [])[0];
  const tradeoff = (match.negatives || [])[0];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">MATCH #{match.rank}</div>
          <h3 className="mt-1 text-base font-semibold text-foreground">{m.name}</h3>
          <div className="mt-1 text-xs text-muted-foreground">
            {startupRangeLabel(m)} · {workModeLabel(m)} · {speedLabel(m.speed_to_first_sale)}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-2xl font-bold text-gradient">{match.fit}%</span>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">PERSONAL FIT</div>
        </div>
      </div>
      {reason && <p className="mt-3 text-xs text-foreground/80">✓ {positiveText(reason)}</p>}
      {tradeoff && <p className="mt-1.5 text-xs text-muted-foreground">– {negativeText(tradeoff)}</p>}
      <Button onClick={onView} variant="outline" className="mt-4 w-full rounded-full py-2.5 text-xs font-semibold">
        VIEW MATCH
      </Button>
    </div>
  );
}