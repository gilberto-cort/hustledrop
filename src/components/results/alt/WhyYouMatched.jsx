import React from 'react';
import { dnaConnection } from '@/lib/matchDisplay';

// WHY YOU MATCHED — the strongest deterministic positive factors from the
// stored MatchResult, translated into personal language tied to the user's
// actual quiz answers. Never AI, never fabricated.
const FACTOR_COPY = {
  budget_fit: { title: 'Your budget works', detail: 'This fits comfortably inside the budget you told us.' },
  low_startup_cost: { title: 'You can start lean', detail: 'It can start with essentially no upfront cost.' },
  skill_alignment: { title: 'Your strengths line up', detail: 'It leans on skills you said you already have.' },
  weekend_fit: { title: 'Your schedule works', detail: 'It fits the weekend-friendly availability you described.' },
  automation_fit: { title: 'Built to systematize', detail: 'It matches your interest in automating over time.' },
  fast_launch_fit: { title: 'You can test quickly', detail: 'It has a relatively fast path to a first sale.' },
  existing_vehicle: { title: 'You have the gear', detail: 'You already own the vehicle it needs.' },
  low_customer_interaction_fit: { title: 'Contact level fits you', detail: 'It matches your preferred level of customer contact.' },
};

export default function WhyYouMatched({ match, dna }) {
  const items = (match.positives || []).slice(0, 3).map((p) => {
    if (FACTOR_COPY[p]) return FACTOR_COPY[p];
    if (p.endsWith('_interest')) {
      const area = p.replace('_interest', '').replace(/_/g, ' ');
      return { title: 'Your interests match', detail: `It connects to your interest in ${area}.` };
    }
    return { title: 'A real fit', detail: p.replace(/_/g, ' ') };
  });
  const dnaLine = dna ? dnaConnection(dna) : null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">WHY YOU MATCHED</div>
      <ul className="mt-3 space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-0.5 font-mono text-primary">✓</span>
            <div>
              <div className="text-sm font-semibold text-foreground">{it.title}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{it.detail}</p>
            </div>
          </li>
        ))}
        {dnaLine && (
          <li className="flex gap-2.5">
            <span className="mt-0.5 font-mono text-primary">✓</span>
            <div>
              <div className="text-sm font-semibold text-foreground">Your DNA fits — {dnaLine.header}</div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{dnaLine.primary}</p>
            </div>
          </li>
        )}
      </ul>
    </section>
  );
}