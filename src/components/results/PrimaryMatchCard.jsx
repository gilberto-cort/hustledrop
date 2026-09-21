import React from 'react';
import { Button } from '@/components/ui/button';
import {
  levelLabel, speedLabel, workModeLabel, startupRangeLabel,
  positiveText, negativeText,
} from '@/lib/matchDisplay';

export default function PrimaryMatchCard({ match, confidence, onBuild, onCompare, onRematch, onShare, shared }) {
  const m = match.model;
  const attrs = [
    ['STARTUP RANGE', startupRangeLabel(m)],
    ['WORK MODE', workModeLabel(m)],
    ['RELATIVE SPEED TO MARKET', speedLabel(m.speed_to_first_sale)],
    ['PHYSICAL INTENSITY', levelLabel(m.physical_intensity)],
    ['SALES INTENSITY', levelLabel(m.sales_intensity)],
    ['AUTOMATION POTENTIAL', levelLabel(m.automation_potential)],
  ];

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">WE FOUND IT.</h1>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground">{m.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>

        <div className="mt-6 flex items-end gap-2">
          <span className="text-5xl font-bold leading-none text-gradient sm:text-6xl">{match.fit}%</span>
          <span className="pb-1 text-xs font-semibold tracking-[0.15em] text-muted-foreground">PERSONAL FIT</span>
        </div>
        <div className="mt-3 text-xs font-medium text-muted-foreground">
          MATCH CONFIDENCE:{' '}
          <span className="font-semibold text-foreground">{confidence?.category || 'GOOD'}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Personal Fit measures compatibility with your stated circumstances — not a prediction of success or income.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {attrs.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">{label}</div>
              <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {m.verification_warning && (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs leading-relaxed text-muted-foreground">
            {m.verification_warning}
          </p>
        )}
      </div>

      <Section title="WHY IT FITS">
        {(match.positives || []).slice(0, 4).map((p, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground/90">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gradient" />
            {positiveText(p)}
          </li>
        ))}
      </Section>

      <Section title="THE TRADEOFF">
        {(match.negatives || []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No major frictions flagged for your profile.</p>
        ) : (
          (match.negatives || []).slice(0, 2).map((n, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />
              {negativeText(n)}
            </li>
          ))
        )}
      </Section>

      <Section title="YOUR FIRST MOVE">
        <p className="text-sm leading-relaxed text-foreground/90">{m.first_validation_action}</p>
      </Section>

      <div className="space-y-3">
        <Button
          onClick={onBuild}
          className="w-full rounded-full bg-brand-gradient py-6 text-sm font-semibold text-white hover:scale-[1.01]"
        >
          BUILD THIS BUSINESS
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={onCompare} variant="outline" className="rounded-full py-3 text-xs font-semibold">
            COMPARE MATCHES
          </Button>
          <Button onClick={onRematch} variant="outline" className="rounded-full py-3 text-xs font-semibold">
            REMATCH
          </Button>
        </div>
        <Button onClick={onShare} variant="outline" className="w-full rounded-full py-3 text-xs font-semibold">
          {shared ? 'COPIED TO CLIPBOARD' : 'SHARE MY MATCH'}
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">{title}</div>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}