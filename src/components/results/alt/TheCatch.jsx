import React from 'react';
import { negativeText } from '@/lib/matchDisplay';

// THE CATCH — the honest tradeoff, candid not legalistic. Headlines are
// deterministic templates for the stored negative factors; nothing is
// exaggerated or invented.
const CATCH_HEADLINES = {
  sales_intensity: {
    title: 'YOU HAVE TO SELL.',
    body: 'This business needs proactive, ongoing outreach before anything becomes repeatable. If you dread prospecting, it can feel harder than the fit number suggests.',
  },
  physical_setup: {
    title: "IT'S PHYSICAL WORK.",
    body: 'Real manual effort is part of the job. Plan for the physical side, not just the fun side.',
  },
  low_automation: {
    title: "IT'S HANDS-ON.",
    body: 'Most of this work stays manual — your own hours are the main input.',
  },
  slow_validation: {
    title: 'IT TAKES PATIENCE.',
    body: 'It takes longer to know whether it is working. Expect a slower feedback loop.',
  },
  weekend_dependency: {
    title: 'WEEKENDS MATTER.',
    body: 'Much of the demand lands on weekends — that will shape your schedule.',
  },
  weather_dependency: {
    title: 'WEATHER AFFECTS IT.',
    body: 'Outdoor conditions can pause the work. Have a plan for off days.',
  },
  equipment_cost: {
    title: "THERE'S AN UPFRONT COST.",
    body: 'Some equipment is needed before you can earn.',
  },
};

export default function TheCatch({ match }) {
  const negatives = match.negatives || [];
  const main =
    negatives.map((n) => CATCH_HEADLINES[n]).find(Boolean) ||
    (negatives[0] ? { title: 'THE HONEST TRADEOFF.', body: negativeText(negatives[0]) } : null);
  if (!main) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-destructive/[0.07] p-5">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">THE CATCH</span>
        <span className="text-[10px] text-muted-foreground/70">Every business has one.</span>
      </div>
      <div className="mt-3 font-mono text-sm font-bold tracking-wider text-foreground">⚠ {main.title}</div>
      <p className="mt-1.5 text-xs leading-relaxed text-foreground/85">{main.body}</p>
      {match.model.verification_warning && (
        <p className="mt-2.5 border-t border-white/10 pt-2 text-[10px] leading-relaxed text-muted-foreground">
          {match.model.verification_warning}
        </p>
      )}
    </section>
  );
}