import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { SIDE_QUESTS } from '@/lib/growService';

// SIDE QUESTS — optional, never block the Main Quest. Each awards XP once.
export default function SideQuests({ doneKeys, busy, onComplete }) {
  const [open, setOpen] = useState(false);
  const done = doneKeys || [];
  const remaining = SIDE_QUESTS.filter((q) => !done.includes(q.key));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between">
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">
          SIDE QUESTS {done.length}/{SIDE_QUESTS.length}
        </span>
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {!open && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {remaining.length > 0
            ? 'Optional moves that sharpen your business — each awards XP once. Never required for the Main Quest.'
            : 'All side quests complete — nice work.'}
        </p>
      )}
      {open && (
        <div className="mt-3 space-y-2">
          {SIDE_QUESTS.map((q) => {
            const isDone = done.includes(q.key);
            return (
              <div
                key={q.key}
                className={`rounded-xl border p-3 ${
                  isDone ? 'border-primary/30 bg-brand-gradient-soft' : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold tracking-wider text-foreground">{q.label}</span>
                  <span className="font-mono text-[9px] font-bold text-primary">+{q.xp} XP</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{q.desc}</p>
                {isDone ? (
                  <div className="mt-2 inline-flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-wider text-primary">
                    <Check className="h-3 w-3" />
                    COMPLETE
                  </div>
                ) : (
                  <button
                    onClick={() => onComplete(q.key)}
                    disabled={busy}
                    className="mt-2.5 w-full rounded-full border border-white/15 py-2 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40 disabled:opacity-40"
                  >
                    MARK DONE
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}