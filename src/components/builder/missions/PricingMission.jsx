import React, { useState } from 'react';
import { Calculator, Tag } from 'lucide-react';
import StrategyDrawer from './StrategyDrawer';
import PricingModule from '../PricingModule';
import { MISSION_META } from './missionMeta';

// MISSION 03 — SET YOUR PRICE. An interactive calculator: the user edits the
// assumptions (price, customers per month, cost per job) with sliders and the
// arithmetic updates live. The generated range is shown as reference. No
// earnings guarantees — outputs are labeled as arithmetic from the user's
// own assumptions, never a forecast.
function parsePrice(v) {
  const m = String(v || '').match(/\d+/);
  return m ? Math.max(1, parseInt(m[0], 10)) : 50;
}

function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">{label}</span>
        <span className="font-mono text-sm font-bold text-primary">{format}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-1.5 w-full accent-primary"
      />
    </div>
  );
}

export default function PricingMission({ content, accepted, model, busy, generating, onGenerate, onConfirm }) {
  const [price, setPrice] = useState(content ? parsePrice(content.test_price) : 50);
  const [jobs, setJobs] = useState(8);
  const [cost, setCost] = useState(0);
  const [drawer, setDrawer] = useState(false);

  if (!content) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
          We’ll draft a pricing hypothesis for your offer, then you set the real numbers yourself with the
          calculator.
        </p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="mt-4 w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {generating ? 'DRAFTING…' : MISSION_META.pricing.generate}
        </button>
      </div>
    );
  }

  const monthlyGross = price * jobs;
  const monthlyCost = cost * jobs;
  const net = monthlyGross - monthlyCost;
  const startup = Number(model && model.startup_max) || 0;
  const monthsToCover = startup > 0 && net > 0 ? Math.ceil(startup / net) : null;

  if (accepted && typeof content.chosen_price === 'number') {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-primary/40 bg-brand-gradient-soft p-4 text-center">
          <div className="font-mono text-[9px] font-bold tracking-widest text-primary">YOUR TEST PRICE</div>
          <div className="mt-1 font-mono text-3xl font-bold text-gradient">${content.chosen_price}</div>
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

      {/* The calculator — user-editable assumptions */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <span className="font-mono text-[10px] font-bold tracking-widest text-primary">YOUR ASSUMPTIONS</span>
        </div>
        <div className="mt-4 space-y-4">
          <Slider label="TEST PRICE PER CUSTOMER" value={price} min={5} max={500} step={5} onChange={setPrice} format={`$${price}`} />
          <Slider label="CUSTOMERS PER MONTH" value={jobs} min={1} max={60} step={1} onChange={setJobs} format={String(jobs)} />
          <Slider label="COST PER CUSTOMER" value={cost} min={0} max={200} step={5} onChange={setCost} format={`$${cost}`} />
        </div>
      </div>

      {/* Live arithmetic — from the user's inputs, nothing else */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-center">
          <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">GROSS / MONTH</div>
          <div className="mt-1 font-mono text-lg font-bold text-foreground">${monthlyGross}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-center">
          <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">AFTER YOUR COSTS</div>
          <div className="mt-1 font-mono text-lg font-bold text-foreground">${net}</div>
        </div>
      </div>
      {monthsToCover && (
        <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
          At these assumptions, a ${startup} startup budget would be covered after about {monthsToCover} months —
          arithmetic from your inputs, not a forecast.
        </p>
      )}
      <p className="text-center text-[10px] leading-relaxed text-muted-foreground">
        Real earnings depend on finding real customers — no result is guaranteed. Test this price and adjust.
      </p>

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