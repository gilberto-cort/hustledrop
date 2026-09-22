import React from 'react';
import { Field, Chip, Card, Note } from './builderKit';

// Module 01 — CUSTOMER: 2–3 segments + best-customer-to-test-first.
export default function CustomerModule({ content }) {
  const segs = content.segments || [];
  const best = typeof content.best_first_index === 'number' ? content.best_first_index : -1;

  return (
    <div>
      {segs.map((s, i) => (
        <Card key={i} highlight={i === best}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
              SEGMENT {i + 1}
              {i === best ? ' · BEST CUSTOMER TO TEST FIRST' : ''}
            </span>
            <Chip>{s.ease_of_reach} REACH</Chip>
          </div>
          <div className="mt-3 space-y-2.5">
            <Field label="WHO THEY ARE">{s.who}</Field>
            <Field label="PROBLEM">{s.problem}</Field>
            <Field label="WHY THEY MIGHT BUY">{s.why_buy}</Field>
            <Field label="WHERE TO FIND THEM">{s.where_to_find}</Field>
          </div>
        </Card>
      ))}
      {best >= 0 && segs[best] && content.best_first_reasoning && (
        <div className="rounded-xl border border-primary/30 bg-white/[0.02] p-4">
          <div className="text-[10px] font-semibold tracking-wider text-primary">BEST CUSTOMER TO TEST FIRST</div>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{content.best_first_reasoning}</p>
        </div>
      )}
      <Note>These segments are a hypothesis, not verified demand — test with real people before committing.</Note>
    </div>
  );
}