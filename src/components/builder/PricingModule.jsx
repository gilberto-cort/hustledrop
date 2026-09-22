import React from 'react';
import { Field, Card, ListField, Note } from './builderKit';

// Module 03 — PRICING: a hypothesis, clearly labeled — never verified market
// acceptance, never fabricated competitor pricing.
export default function PricingModule({ content }) {
  return (
    <div>
      <div className="rounded-xl border-2 border-primary/40 bg-brand-gradient-soft p-4 text-center">
        <span className="font-mono text-xs font-bold tracking-[0.2em] text-primary">
          PRICING HYPOTHESIS — TEST WITH REAL CUSTOMERS
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">TEST PRICE</div>
          <div className="mt-1 text-xl font-bold text-gradient">{content.test_price}</div>
        </Card>
        <Card>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">LOWER TEST</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{content.lower_test}</div>
        </Card>
        <Card>
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">PREMIUM VERSION</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{content.premium_version}</div>
        </Card>
      </div>
      <Card>
        <div className="space-y-3">
          <Field label="WHY THIS RANGE">{content.why_this_range}</Field>
          <ListField label="WHAT ASSUMPTIONS IT USES" items={content.assumptions} />
          <Field label="SIMPLE BREAK-EVEN EXAMPLE">{content.break_even_example}</Field>
        </div>
      </Card>
      <Note>
        This range is a starting point derived from your budget and offer — it is not verified local market data. Test
        it with real customers and adjust.
      </Note>
    </div>
  );
}