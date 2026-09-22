import React from 'react';
import { Field, Chip, Card, ListField, Note } from './builderKit';

// Module 02 — OFFER: three concepts + recommended first offer.
export default function OfferModule({ content }) {
  const offers = content.offers || [];
  const rec = typeof content.recommended_index === 'number' ? content.recommended_index : -1;

  return (
    <div>
      {offers.map((o, i) => (
        <Card key={i} highlight={i === rec}>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground">{o.name}</h3>
            {i === rec ? <Chip tone="primary">RECOMMENDED FIRST OFFER</Chip> : <Chip>OPTION {i + 1}</Chip>}
          </div>
          <div className="mt-3 space-y-2.5">
            <Field label="WHAT THE CUSTOMER GETS">{o.customer_gets}</Field>
            <Field label="CORE OUTCOME">{o.core_outcome}</Field>
            <Field label="DELIVERY METHOD">{o.delivery_method}</Field>
            <ListField label="WHAT IS INCLUDED" items={o.included} />
            <ListField label="WHAT IS NOT INCLUDED" items={o.not_included} />
            <Field label="ESTIMATED DELIVERY EFFORT">{o.delivery_effort}</Field>
            <Field label="STARTUP REQUIREMENTS">{o.startup_requirements}</Field>
          </div>
        </Card>
      ))}
      {rec >= 0 && content.recommended_reasoning && (
        <div className="rounded-xl border border-primary/30 bg-white/[0.02] p-4">
          <div className="text-[10px] font-semibold tracking-wider text-primary">WHY THIS ONE FIRST</div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{content.recommended_reasoning}</p>
        </div>
      )}
      <Note>Recommended for being simple, testable and within budget — not because it sounds premium.</Note>
    </div>
  );
}