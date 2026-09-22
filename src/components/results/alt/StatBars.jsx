import React from 'react';
import { statBarSegments, SEGMENT_FILLS, workTraits } from '@/lib/businessCategory';
import { levelLabel, speedLabel, startupRangeLabel } from '@/lib/matchDisplay';

// BUSINESS STATS — RPG character-screen style. Each bar is a visual read of
// the model's existing 1–5 attribute (×2 = filled segments), in the brand
// purple → pink → orange gradient. Startup cost stays a hard number.
const BAR_STATS = [
  { key: 'speed_to_first_sale', label: 'SPEED TO MARKET', word: (v) => speedLabel(v).toUpperCase() },
  { key: 'sales_intensity', label: 'SALES', word: (v) => levelLabel(v).toUpperCase() },
  { key: 'automation_potential', label: 'AUTOMATION', word: (v) => levelLabel(v).toUpperCase() },
  { key: 'scalability', label: 'SCALABILITY', word: (v) => levelLabel(v).toUpperCase() },
  { key: 'physical_intensity', label: 'PHYSICAL EFFORT', word: (v) => levelLabel(v).toUpperCase() },
  { key: 'customer_interaction', label: 'CUSTOMER CONTACT', word: (v) => levelLabel(v).toUpperCase() },
];

export default function StatBars({ match }) {
  const m = match.model;
  const max = Number(m.startup_max) || 0;
  const startupWord = max <= 250 ? 'LOW COST' : max <= 1000 ? 'MODERATE COST' : 'HIGHER COST';
  const traits = workTraits(m);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">BUSINESS STATS</div>
      <div className="mt-3 flex items-baseline justify-between border-b border-white/10 pb-3">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">STARTUP COST</span>
        <span className="text-sm font-semibold text-foreground">
          {startupRangeLabel(m)}
          <span className="ml-1.5 font-mono text-[9px] font-bold tracking-wider text-primary">{startupWord}</span>
        </span>
      </div>
      <div className="mt-3 space-y-3">
        {BAR_STATS.map((s) => (
          <div key={s.key}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">{s.label}</span>
              <span className="shrink-0 font-mono text-[9px] font-bold tracking-wider text-primary">
                {s.word(m[s.key])}
              </span>
            </div>
            <div className="mt-1 flex h-2 gap-0.5">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 flex-1 rounded-[2px] ${i < statBarSegments(m[s.key]) ? SEGMENT_FILLS[i] : 'bg-white/10'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {traits.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {traits.map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-foreground/80"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        A visual read of this model's 1–5 attributes — a feel for the work, not a precise measurement.
      </p>
    </section>
  );
}