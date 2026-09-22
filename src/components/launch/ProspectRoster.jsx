import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { PROSPECT_ACTIONS, STATUS_LABELS, CHANNEL_OPTIONS, OBJECTION_OPTIONS } from '@/lib/launchService';

const DECLINABLE = ['prospect', 'contacted', 'conversation', 'followed_up', 'lead'];

function StatusChip({ status }) {
  const tones = {
    customer: 'border-primary/40 bg-primary/10 text-primary',
    declined: 'border-white/10 bg-white/5 text-muted-foreground',
    lead: 'border-accent/40 bg-accent/10 text-accent',
  };
  return (
    <span className={`rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest ${tones[status] || 'border-white/15 bg-white/5 text-muted-foreground'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// Prospect roster — the real-action ladder. No "mark complete" buttons:
// every button records an actual business action.
export default function ProspectRoster({ prospects, busy, onAdd, onAdvance }) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState(CHANNEL_OPTIONS[0]);
  const [declineFor, setDeclineFor] = useState(null);
  const [objection, setObjection] = useState('not_interested');
  const [declineNotes, setDeclineNotes] = useState('');

  const submitAdd = () => {
    if (!name.trim() || busy) return;
    onAdd({ name_or_alias: name, channel });
    setName('');
  };

  const submitDecline = (p) => {
    if (busy) return;
    onAdvance(p, 'declined', { objection_type: objection, notes: declineNotes });
    setDeclineFor(null);
    setDeclineNotes('');
  };

  return (
    <div>
      <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">PROSPECT ROSTER</div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitAdd()}
          placeholder="Prospect name or alias…"
          className="flex-1 rounded-full border border-input bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="rounded-full border border-input bg-transparent px-4 py-2 text-xs text-foreground"
        >
          {CHANNEL_OPTIONS.map((c) => (
            <option key={c} value={c} className="bg-card">
              {c.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <button
          onClick={submitAdd}
          disabled={busy || !name.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-gradient px-4 py-2 text-xs font-bold tracking-wider text-white disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          ADD PROSPECT
        </button>
      </div>

      {prospects.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">No prospects yet — add your first above.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {prospects.map((p) => {
            const action = PROSPECT_ACTIONS[p.status];
            return (
              <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{p.name_or_alias}</span>
                    <span className="font-mono text-[9px] tracking-wider text-muted-foreground">
                      {(p.channel || '').replace(/_/g, ' ')}
                    </span>
                    <StatusChip status={p.status} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {action && (
                      <button
                        onClick={() => !busy && onAdvance(p, action.next)}
                        disabled={busy}
                        className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[10px] font-bold tracking-wider text-primary transition hover:bg-primary/20 disabled:opacity-40"
                      >
                        {action.label}
                      </button>
                    )}
                    {p.status === 'lead' && (
                      <button
                        onClick={() => !busy && onAdvance(p, 'customer', {})}
                        disabled={busy}
                        className="rounded-full bg-brand-gradient px-3 py-1.5 text-[10px] font-bold tracking-wider text-white disabled:opacity-40"
                      >
                        RECORD CUSTOMER WIN
                      </button>
                    )}
                    {DECLINABLE.includes(p.status) && (
                      <button
                        onClick={() => setDeclineFor(declineFor === p.id ? null : p.id)}
                        className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold tracking-wider text-muted-foreground transition hover:text-foreground"
                      >
                        {declineFor === p.id ? 'CANCEL' : "THEY SAID NO"}
                      </button>
                    )}
                  </div>
                </div>

                {declineFor === p.id && (
                  <div className="mt-3 rounded-lg border border-white/10 p-3">
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      A "no" is market feedback — it makes your next pitch sharper. No shame in it.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {OBJECTION_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setObjection(o.value)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] transition ${
                            objection === o.value
                              ? 'border-primary/50 bg-primary/10 text-primary'
                              : 'border-white/15 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <input
                      value={declineNotes}
                      onChange={(e) => setDeclineNotes(e.target.value)}
                      placeholder="Optional note — what did they say?"
                      className="mt-2 w-full rounded-lg border border-input bg-transparent px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground"
                    />
                    <button
                      onClick={() => submitDecline(p)}
                      disabled={busy}
                      className="mt-2 rounded-full border border-white/20 px-4 py-1.5 text-[10px] font-bold tracking-wider text-foreground disabled:opacity-40"
                    >
                      SAVE AS MARKET FEEDBACK
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}