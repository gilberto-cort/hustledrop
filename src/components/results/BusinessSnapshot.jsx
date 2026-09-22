import React from 'react';
import { levelLabel, speedLabel, workModeLabel, startupRangeLabel } from '@/lib/matchDisplay';

// BUSINESS SNAPSHOT — deterministic model attributes only. Speed labels are
// relative to other models, never guaranteed time-to-sale promises.
export default function BusinessSnapshot({ match }) {
  const m = match.model;
  const rows = [
    ['STARTUP RANGE', startupRangeLabel(m)],
    ['WORK MODE', workModeLabel(m)],
    ['SPEED TO MARKET', speedLabel(m.speed_to_first_sale)],
    ['PHYSICAL EFFORT', `${levelLabel(m.physical_intensity)} · ${m.physical_intensity}/5`],
    ['SALES INTENSITY', `${levelLabel(m.sales_intensity)} · ${m.sales_intensity}/5`],
    ['CUSTOMER INTERACTION', `${levelLabel(m.customer_interaction)} · ${m.customer_interaction}/5`],
    ['AUTOMATION POTENTIAL', `${levelLabel(m.automation_potential)} · ${m.automation_potential}/5`],
    ['SCALABILITY', `${levelLabel(m.scalability)} · ${m.scalability}/5`],
  ];
  if (m.weekend_friendly) rows.push(['WEEKEND FRIENDLY', 'Yes']);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">BUSINESS SNAPSHOT</div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Speed to market is relative to other business models — not a guaranteed time to first sale.
      </p>
    </section>
  );
}