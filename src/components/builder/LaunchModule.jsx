import React, { useState } from 'react';
import { Field, Card, Note } from './builderKit';

// Module 07 — LAUNCH: 7-day validation sprint. Days are stored structurally
// so a future First Customer Quest can consume them directly.
export default function LaunchModule({ content }) {
  const [done, setDone] = useState({});
  const days = (content.sprint_days || []).slice().sort((a, b) => (a.day || 0) - (b.day || 0));

  return (
    <div>
      <div className="rounded-xl border border-primary/30 bg-white/[0.02] p-4">
        <div className="text-[10px] font-semibold tracking-wider text-primary">THE GOAL</div>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
          Not to build the whole company in seven days — to get real-world feedback and move toward your first
          qualified customer conversation.
        </p>
        {content.execution_note && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{content.execution_note}</p>
        )}
      </div>
      {days.map((d, i) => (
        <Card key={i} highlight={!!done[i]}>
          <div className="flex items-start justify-between gap-2">
            <span className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground">DAY {d.day}</span>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={!!done[i]}
                onChange={() => setDone((p) => ({ ...p, [i]: !p[i] }))}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground">DONE</span>
            </label>
          </div>
          <div className="mt-2 space-y-2.5">
            <Field label="ONE PRIMARY ACTION">{d.primary_action}</Field>
            <Field label="WHY IT MATTERS">{d.why_it_matters}</Field>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                TIME: {d.estimated_time}
              </span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                COST: {d.estimated_cost}
              </span>
            </div>
          </div>
        </Card>
      ))}
      <Note>
        The sprint is sized to your available hours and budget — day checkmarks are session-only notes for now and are
        not permanently saved.
      </Note>
    </div>
  );
}