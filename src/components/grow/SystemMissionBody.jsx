import React, { useState } from 'react';
import { GenCTA } from './growKit';

// THE SYSTEM — a lightweight operating loop adapted to the business.
// KEEP IT / EDIT / TRY ANOTHER, then EQUIP SYSTEM.
export default function SystemMissionBody({ def, mission, busy, actions }) {
  const content = (mission && mission.content) || {};
  const [editing, setEditing] = useState(false);
  const [stepsText, setStepsText] = useState('');

  const steps = Array.isArray(content.steps) ? content.steps : [];

  if (!content.loop_name && !def.completed) {
    return (
      <GenCTA
        label="DRAFT MY OPERATING LOOP"
        busy={busy}
        onClick={() => actions.onGenerate('system')}
        note="A simple repeatable customer loop built around your business model — no paid tools, no premature automation."
      />
    );
  }

  return (
    <div className="space-y-4">
      {content.loop_name && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">YOUR CUSTOMER LOOP</div>
          <div className="mt-1 font-mono text-sm font-bold tracking-wider text-foreground">{content.loop_name}</div>
        </div>
      )}

      {!editing ? (
        <ol className="space-y-1.5">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
              <span className="font-mono text-[10px] font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-xs leading-relaxed text-foreground/90">{s}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="space-y-2">
          <textarea
            value={stepsText}
            onChange={(e) => setStepsText(e.target.value)}
            rows={Math.max(6, steps.length + 1)}
            className="w-full resize-none rounded-xl border border-input bg-transparent px-3.5 py-3 text-xs leading-relaxed text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="One step per line…"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 rounded-full border border-white/15 py-2.5 text-xs font-bold tracking-wider text-foreground"
            >
              CANCEL
            </button>
            <button
              onClick={() => {
                actions.onSaveSystemSteps(stepsText);
                setEditing(false);
              }}
              disabled={busy}
              className="flex-1 rounded-full bg-brand-gradient py-2.5 text-xs font-bold tracking-wider text-white disabled:opacity-40"
            >
              SAVE STEPS
            </button>
          </div>
        </div>
      )}

      {content.weekly_rhythm && !editing && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">WEEKLY RHYTHM</div>
          <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{content.weekly_rhythm}</p>
        </div>
      )}

      {!def.completed && !editing && (
        <div className="flex flex-col gap-2">
          <button
            onClick={actions.onEquipSystem}
            disabled={busy}
            className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
          >
            KEEP IT — EQUIP SYSTEM
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStepsText(steps.join('\n'));
                setEditing(true);
              }}
              className="flex-1 rounded-full border border-white/15 py-2.5 text-xs font-bold tracking-wider text-foreground transition hover:border-primary/40"
            >
              EDIT
            </button>
            <button
              onClick={() => actions.onGenerate('system')}
              disabled={busy}
              className="flex-1 rounded-full border border-white/15 py-2.5 text-xs font-bold tracking-wider text-foreground transition hover:border-primary/40 disabled:opacity-40"
            >
              TRY ANOTHER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}