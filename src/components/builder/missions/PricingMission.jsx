import React, { useEffect, useRef, useState } from 'react';
import { Calculator, Tag, RotateCcw } from 'lucide-react';
import StrategyDrawer from './StrategyDrawer';
import PricingModule from '../PricingModule';
import { MISSION_META } from './missionMeta';

// MISSION 03 — SET YOUR PRICE. The calculator's starting point is the accepted
// pricing hypothesis — an EDITABLE ESTIMATE (offer packages don't carry
// prices). Customers/month starts at a conservative illustrative 2, never
// presented as expected demand. Every output is plain arithmetic from the
// user's own inputs — not a forecast, not profit.

// Robust money parse — handles "$1,200" (the old regex stopped at the comma
// and initialized the calculator at $1).
function parseMoney(v, fallback) {
  const m = String(v || '').replace(/,/g, '').match(/\d+(\.\d+)?/);
  const n = m ? parseFloat(m[0]) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

// Starting assumptions: a previous calculator run wins, then the generated
// test price, then a neutral placeholder.
function defaultsFrom(content) {
  const calc = content && content.calc_assumptions;
  const prevPrice = calc && Number(calc.price) > 0 ? Math.round(Number(calc.price)) : 0;
  const prevJobs = calc && Number(calc.jobs_per_month) > 0 ? Math.round(Number(calc.jobs_per_month)) : 0;
  const prevCost = calc && Number(calc.cost_per_job) >= 0 ? Math.round(Number(calc.cost_per_job)) : -1;
  return {
    price: prevPrice || parseMoney(content && content.test_price, 50),
    jobs: prevJobs || 2, // conservative illustrative assumption — never expected demand
    cost: prevCost >= 0 ? prevCost : 0,
  };
}

const fmt = (n) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString('en-US')}`;

function AssumptionInput({ label, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-bold text-primary">{format}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) onChange(Math.min(max, Math.max(min, Math.round(n))));
          }}
          aria-label={`${label} — exact number`}
          className="w-20 shrink-0 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-right font-mono text-xs font-bold text-foreground outline-none focus:border-primary/40"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label} slider`}
          className="min-w-0 flex-1 accent-primary"
        />
      </div>
    </div>
  );
}

export default function PricingMission({ content, accepted, model, busy, generating, onGenerate, onConfirm, ui, onUi }) {
  const [values, setValues] = useState(() => (ui && ui.values) || defaultsFrom(content));
  const customized = useRef(!!(ui && ui.values));
  const [drawer, setDrawer] = useState(false);

  // A new hypothesis (TRY ANOTHER) updates the starting numbers ONLY while the
  // user hasn't made them their own — a locked price lives in the accepted
  // record and is never touched here.
  useEffect(() => {
    if (!customized.current) setValues(defaultsFrom(content));
  }, [content]);

  if (!content) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
          We’ll draft a pricing hypothesis for your offer, then you set the real numbers yourself with the
          calculator.
        </p>
        <button
          onClick={() => onGenerate()}
          disabled={generating}
          className="mt-4 w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {generating ? 'DRAFTING…' : MISSION_META.pricing.generate}
        </button>
      </div>
    );
  }

  const edit = (key, v) => {
    customized.current = true;
    const next = { ...values, [key]: v };
    setValues(next);
    // AUTOSAVED — calculator assumptions survive leaving mid-mission.
    if (onUi) onUi({ values: next }, { debounceMs: 500 });
  };

  if (accepted && typeof content.chosen_price === 'number') {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-primary/40 bg-brand-gradient-soft p-4 text-center">
          <div className="font-mono text-[9px] font-bold tracking-widest text-primary">YOUR LOCKED-IN PRICE</div>
          <div className="mt-1 font-mono text-3xl font-bold text-gradient">${content.chosen_price.toLocaleString('en-US')}</div>
          {content.calc_assumptions && (
            <p className="mt-1 font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
              {content.calc_assumptions.jobs_per_month} CUSTOMERS/MO · ${content.calc_assumptions.cost_per_job} COST EACH
            </p>
          )}
        </div>
        <button
          onClick={() => setDrawer(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
        >
          VIEW FULL PRICING STRATEGY
        </button>
        <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 03 · FULL PRICING STRATEGY">
          <PricingModule content={content} />
        </StrategyDrawer>
      </div>
    );
  }

  const suggested = defaultsFrom(content);
  const { price, jobs, cost } = values;
  const gross = price * jobs;
  const varCosts = cost * jobs;
  const contribution = gross - varCosts;
  const startup = Number(model && model.startup_max) || 0;
  const monthsToCover = startup > 0 && contribution > 0 ? Math.ceil(startup / contribution) : null;
  const priceMax = Math.max(1000, Math.ceil((suggested.price * 2) / 500) * 500);
  const costMax = Math.max(200, Math.ceil(suggested.price / 100) * 100);

  return (
    <div className="space-y-3">
      {/* Reference range from the generated hypothesis */}
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-foreground/85">
          <Tag className="h-3 w-3 text-primary" />
          HYPOTHESIS: {content.test_price}
        </span>
        {content.lower_test && (
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
            LOWER: {content.lower_test}
          </span>
        )}
        {content.premium_version && (
          <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
            PREMIUM: {content.premium_version}
          </span>
        )}
      </div>

      {/* The calculator — user-editable assumptions, numeric input + slider each */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="font-mono text-[10px] font-bold tracking-widest text-primary">YOUR ASSUMPTIONS</span>
          </div>
          <button
            onClick={() => {
              customized.current = false;
              const next = defaultsFrom(content);
              setValues(next);
              if (onUi) onUi({ values: next });
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 font-mono text-[8px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            <RotateCcw className="h-2.5 w-2.5" />
            RESET TO SUGGESTED
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <AssumptionInput
            label="TEST PRICE PER CUSTOMER"
            value={price}
            min={1}
            max={priceMax}
            step={5}
            onChange={(v) => edit('price', v)}
            format={fmt(price)}
          />
          <AssumptionInput
            label="CUSTOMERS PER MONTH"
            value={jobs}
            min={1}
            max={30}
            step={1}
            onChange={(v) => edit('jobs', v)}
            format={String(jobs)}
          />
          <AssumptionInput
            label="COST PER CUSTOMER"
            value={cost}
            min={0}
            max={costMax}
            step={5}
            onChange={(v) => edit('cost', v)}
            format={fmt(cost)}
          />
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
          Starting point: {fmt(suggested.price)} comes from your pricing hypothesis and customers/month starts at an
          illustrative 2 — editable guesses, not expected demand or a recommended price.
        </p>
      </div>

      {/* Live arithmetic — from the user's inputs, nothing else */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
          <div className="font-mono text-[8px] font-bold tracking-widest text-muted-foreground">GROSS REVENUE / MO</div>
          <div className="mt-1 font-mono text-sm font-bold text-foreground">{fmt(gross)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
          <div className="font-mono text-[8px] font-bold tracking-widest text-muted-foreground">EST. VARIABLE COSTS</div>
          <div className="mt-1 font-mono text-sm font-bold text-foreground">{fmt(varCosts)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
          <div className="font-mono text-[8px] font-bold tracking-widest text-muted-foreground">CONTRIBUTION / MO</div>
          <div className="mt-1 font-mono text-sm font-bold text-foreground">{fmt(contribution)}</div>
        </div>
      </div>
      <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
        Contribution is revenue minus your per-customer costs, before fixed costs like insurance, subscriptions or
        taxes — it is not profit.
      </p>
      {startup > 0 && contribution > 0 && (
        <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
          Illustrative startup-cost recovery: at these assumptions, an estimated {fmt(startup)} startup cost would be
          covered after about {monthsToCover} months — arithmetic from your inputs, not a forecast.
        </p>
      )}
      {startup > 0 && contribution <= 0 && (
        <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
          At these assumptions your monthly contribution is {fmt(contribution)} — startup costs aren’t recovered at
          this rate. Adjust your price, customers or costs.
        </p>
      )}

      <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-4">
        <button
          onClick={() =>
            onConfirm({
              chosen_price: price,
              calc_assumptions: { price, jobs_per_month: jobs, cost_per_job: cost },
            })
          }
          disabled={busy}
          className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
        >
          {busy ? 'LOCKING IN…' : 'LOCK IN MY PRICE'}
        </button>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
          Saves your price and assumptions — you can change them anytime.
        </p>
      </div>

      <button
        onClick={() => setDrawer(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
      >
        VIEW FULL PRICING STRATEGY
      </button>
      <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 03 · FULL PRICING STRATEGY">
        <PricingModule content={content} />
      </StrategyDrawer>
    </div>
  );
}