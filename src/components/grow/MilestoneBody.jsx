import React from 'react';
import { sourceLabel } from '@/lib/growService';

// Milestone quests (Customer #1 / #3 / #5) — measured from real CustomerWin
// records; no separate disconnected counter exists.
export default function MilestoneBody({ def, wins, onRecordCustomer }) {
  const pct = Math.min(100, Math.round((def.current_count / def.target) * 100));
  const done = def.completed;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground">
          <span>PROGRESS</span>
          <span className="font-mono">
            {def.current_count} / {def.target}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-brand-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {def.type === 'customer_1' && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          You earned this in Launch Mode — your first real paying customer. Grow starts from that record: every
          customer you log here and in Launch counts once, from the same persistent data.
        </p>
      )}

      {def.type === 'customer_3' && !done && (
        <>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Record customers as you win them — Grow and Launch share the same records, so nothing is counted twice.
          </p>
          <button
            onClick={onRecordCustomer}
            className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01]"
          >
            RECORD A CUSTOMER
          </button>
        </>
      )}

      {def.type === 'customer_3' && done && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="font-mono text-[10px] font-bold tracking-widest text-primary">
            ACHIEVEMENT — PROOF OF MOTION
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">
            "You've now recorded three customers. That's enough activity to start looking for patterns — not enough
            to assume the model is proven."
          </p>
        </div>
      )}

      {def.type === 'customer_5' && !done && (
        <>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Five real customers is Grow v1's final milestone. Keep running your loop and log each win as it happens.
          </p>
          <button
            onClick={onRecordCustomer}
            className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01]"
          >
            RECORD A CUSTOMER
          </button>
        </>
      )}

      {def.type === 'customer_5' && done && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Five customers recorded — you're building momentum. Keep logging new wins; your records power the next
          chapter.
        </p>
      )}

      {(wins || []).length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">YOUR CUSTOMERS</div>
          {(wins || []).slice(0, 5).map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              <span className="truncate text-xs text-foreground/90">
                {w.display_name || 'Customer'}{w.offer_name ? ` — ${w.offer_name}` : ''}
              </span>
              <span className="font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
                {sourceLabel(w.acquisition_channel)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}