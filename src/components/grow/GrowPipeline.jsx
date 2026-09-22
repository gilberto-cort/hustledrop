import React from 'react';
import { STATUS_LABELS, PROSPECT_ACTIONS } from '@/lib/launchService';

const STAGES = [
  { label: 'PROSPECT', statuses: ['prospect'] },
  { label: 'CONTACTED', statuses: ['contacted'] },
  { label: 'CONVERSATION', statuses: ['conversation', 'followed_up'] },
  { label: 'LEAD', statuses: ['lead'] },
  { label: 'CUSTOMER', statuses: ['customer'] },
];

// GROW CRM LITE — the same persistent pipeline Launch uses. Moving a record
// updates the same metrics everywhere; nothing is counted twice.
export default function GrowPipeline({ prospects, busy, onAddProspect, onAdvance, onLogCustomer }) {
  const list = (prospects || []).filter((p) => p.status !== 'declined');
  const countFor = (s) => list.filter((p) => s.statuses.includes(p.status)).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">PIPELINE</span>
        <span className="font-mono text-[9px] font-bold tracking-wider text-muted-foreground">SAME RECORDS AS LAUNCH</span>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {STAGES.map((s) => (
          <div key={s.label} className="rounded-lg border border-white/10 bg-white/[0.02] py-2 text-center">
            <div className="font-mono text-[8px] font-bold tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-0.5 font-mono text-sm font-bold text-foreground">{countFor(s)}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={onAddProspect}
          className="flex-1 rounded-full border border-white/15 py-2.5 text-xs font-bold tracking-wider text-foreground transition hover:border-primary/40"
        >
          ADD PROSPECT
        </button>
        <button
          onClick={onLogCustomer}
          className="flex-1 rounded-full bg-brand-gradient py-2.5 text-xs font-bold tracking-wider text-white transition hover:scale-[1.01]"
        >
          LOG A CUSTOMER
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {list.length === 0 ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            No records yet — add a prospect or log your next customer.
          </p>
        ) : (
          list.map((p) => {
            const action = PROSPECT_ACTIONS[p.status];
            return (
              <div key={p.id} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-foreground">{p.name_or_alias}</div>
                  <div className="font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
                    {STATUS_LABELS[p.status]}
                  </div>
                </div>
                {action ? (
                  <button
                    onClick={() => onAdvance(p, action.next)}
                    disabled={busy}
                    className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40 disabled:opacity-40"
                  >
                    {action.label}
                  </button>
                ) : (
                  <span className="rounded-full border border-primary/40 bg-brand-gradient-soft px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-primary">
                    WON
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Moving a record updates the same metrics Launch uses — nothing is counted twice.
      </p>
    </div>
  );
}