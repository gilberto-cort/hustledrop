import React, { useState } from 'react';
import { GenCTA, EquippedList } from './growKit';
import { CUSTOMER_SOURCE_OPTIONS, sourceLabel } from '@/lib/growService';

// REPEAT THE WIN — how did customer #1 find you? The analysis is explicitly
// an early hypothesis based on ONE customer, never a claim of causation.
export default function RepeatWinMissionBody({ def, mission, wins, equipped, busy, actions }) {
  const inputs = (mission && mission.inputs) || {};
  const content = (mission && mission.content) || {};
  const [source, setSource] = useState(inputs.source || '');

  const firstWin = (wins || [])[0];
  const recorded = firstWin?.acquisition_channel;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">
          HOW DID CUSTOMER #1 FIND YOU?
        </div>
        {recorded && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            Recorded in your pipeline: {sourceLabel(recorded)}
          </p>
        )}
        <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {CUSTOMER_SOURCE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setSource(opt);
                actions.onSaveSource(opt);
              }}
              className={`rounded-lg border px-2.5 py-2.5 text-[10px] font-semibold leading-tight transition ${
                source === opt
                  ? 'border-primary/60 bg-brand-gradient-soft text-primary'
                  : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground'
              }`}
            >
              {sourceLabel(opt).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <EquippedList items={equipped} />

      {source && !content.what_worked && !def.completed && (
        <GenCTA
          label="ANALYZE THE WIN"
          busy={busy}
          onClick={() => actions.onGenerate('repeat_win', { source })}
          note="HustleDrop builds an early hypothesis from your one real customer — repeatable next steps, no proven-demand claims."
        />
      )}

      {content.what_worked && (
        <div className="space-y-2">
          {[
            ['WHAT WORKED', content.what_worked],
            ['WHAT TO REPEAT', content.what_to_repeat],
            ['WHAT TO CHANGE', content.what_to_change],
            ['NEXT EXPERIMENT', content.next_experiment],
          ]
            .filter(([, v]) => v)
            .map(([label, v]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">{label}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{v}</p>
              </div>
            ))}
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Early hypothesis based on one customer — a useful direction to test, not proof the model works.
          </p>
        </div>
      )}

      {content.what_worked && !def.completed && (
        <button
          onClick={actions.onCompleteRepeatWin}
          disabled={busy}
          className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
        >
          I'M ON IT — ACCEPT THE PLAN
        </button>
      )}
    </div>
  );
}