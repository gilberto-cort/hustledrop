import React from 'react';
import { levelLabel, speedLabel, workModeLabel, startupRangeLabel, positiveText } from '@/lib/matchDisplay';

export default function AltMatchCard({ match }) {
  const m = match.model;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">MATCH #{match.rank}</div>
          <h3 className="mt-1 text-base font-semibold text-foreground">{m.name}</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-gradient">{match.fit}%</span>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">PERSONAL FIT</div>
        </div>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[startupRangeLabel(m), workModeLabel(m), speedLabel(m.speed_to_first_sale), levelLabel(m.physical_intensity) + ' physical'].map((t) => (
          <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            {t}
          </span>
        ))}
      </div>
      {(match.positives || []).slice(0, 1).map((p, i) => (
        <p key={i} className="mt-3 text-xs text-foreground/80">✓ {positiveText(p)}</p>
      ))}
    </div>
  );
}