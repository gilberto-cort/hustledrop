import React from 'react';

// Compact WHO? selector — horizontal chips of the contacts this mission's
// one-tap action can apply to, plus SOMEONE NEW for a quick unnamed record.
export default function ContactPicker({ contacts, selectedId, onSelect, allowNew = true, emptyHint }) {
  if (!contacts || contacts.length === 0) {
    return <p className="text-[11px] leading-relaxed text-muted-foreground">{emptyHint}</p>;
  }
  return (
    <div>
      <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">WHO?</div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {contacts.map((c) => {
          const on = selectedId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(on ? null : c.id)}
              aria-pressed={on}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                on
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-white/15 bg-white/[0.02] text-foreground/80 hover:border-primary/40'
              }`}
            >
              {c.name_or_alias}
            </button>
          );
        })}
        {allowNew && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-pressed={selectedId === null}
            className={`shrink-0 rounded-full border border-dashed px-3 py-1.5 text-[11px] font-bold transition ${
              selectedId === null
                ? 'border-primary/60 bg-primary/10 text-primary'
                : 'border-white/20 text-muted-foreground hover:text-foreground'
            }`}
          >
            + SOMEONE NEW
          </button>
        )}
      </div>
    </div>
  );
}