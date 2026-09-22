import React from 'react';
import { Check, Lock } from 'lucide-react';

// BUILD QUEST MAP — six mission nodes on a dashed quest path. Completed =
// filled gradient, active = glowing, locked = dim. States derive from ACCEPTED
// records only; nothing is awarded by navigation.
export default function MissionMap({ modules, onSelect }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">BUILD QUEST MAP</div>
      <div className="relative mt-3">
        <div className="absolute left-[8%] right-[8%] top-5 border-t border-dashed border-white/15" />
        <div className="relative grid grid-cols-6 gap-1">
          {modules.map((m) => (
            <button
              key={m.key}
              disabled={m.locked}
              onClick={() => onSelect(m.key)}
              aria-current={m.active ? 'page' : undefined}
              aria-label={`${m.num} ${m.label}${m.accepted ? ' (complete)' : m.locked ? ' (locked)' : ''}`}
              className="group flex flex-col items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border font-mono text-[11px] font-bold transition ${
                  m.accepted
                    ? 'border-primary bg-brand-gradient text-white'
                    : m.active
                      ? 'glow-primary border-primary/60 bg-brand-gradient-soft text-primary'
                      : m.locked
                        ? 'border-white/10 text-muted-foreground/40'
                        : 'border-white/20 text-foreground/70 group-hover:border-primary/40'
                }`}
              >
                {m.accepted ? <Check className="h-4 w-4" /> : m.locked ? <Lock className="h-3.5 w-3.5" /> : m.num}
              </span>
              <span
                className={`max-w-full truncate text-[8px] font-bold tracking-wider ${
                  m.active ? 'text-primary' : m.locked ? 'text-muted-foreground/40' : 'text-muted-foreground'
                }`}
              >
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}