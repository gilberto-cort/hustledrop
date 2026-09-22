import React from 'react';
import { Check, Lock } from 'lucide-react';

// Module progress navigation — one active module at a time (mobile-friendly).
export default function ModuleNav({ modules, activeKey, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 pb-1">
      {modules.map((m) => {
        const active = m.key === activeKey;
        const disabled = m.locked;
        return (
          <button
            key={m.key}
            disabled={disabled}
            onClick={() => onSelect(m.key)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider transition ${
              active
                ? 'border-primary/50 bg-brand-gradient-soft text-foreground'
                : disabled
                  ? 'border-white/5 text-muted-foreground/40'
                  : 'border-white/15 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{m.num}</span>
            <span>{m.label}</span>
            {m.accepted ? (
              <Check className="h-3 w-3 text-primary" />
            ) : disabled ? (
              <Lock className="h-3 w-3" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}