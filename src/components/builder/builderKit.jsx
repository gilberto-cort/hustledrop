import React from 'react';

// Small shared building blocks for module displays.

export function Field({ label, children }) {
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm leading-relaxed text-foreground/90">{children}</div>
    </div>
  );
}

export function ListField({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">{label}</div>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground/90">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Chip({ children, tone = 'muted' }) {
  const tones = {
    muted: 'border-white/15 bg-white/5 text-muted-foreground',
    primary: 'border-primary/40 bg-primary/10 text-primary',
    warn: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold tracking-widest ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Note({ children }) {
  return <p className="text-[11px] leading-relaxed text-muted-foreground">{children}</p>;
}

export function Card({ children, highlight = false, className = '' }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? 'border-primary/40 bg-brand-gradient-soft' : `border-white/10 bg-white/[0.02] ${className}`
      }`}
    >
      {children}
    </div>
  );
}