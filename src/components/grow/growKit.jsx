import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Small shared pieces for Grow mission bodies.

export function GenCTA({ label, note, busy, onClick }) {
  return (
    <div className="space-y-2">
      <button
        onClick={onClick}
        disabled={busy}
        className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
      >
        {busy ? 'DRAFTING…' : label}
      </button>
      {note && <p className="text-[10px] leading-relaxed text-muted-foreground">{note}</p>}
    </div>
  );
}

export function CopyBlock({ label, value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      // clipboard unavailable — text is still readable above
    }
  };
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">{label}</span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{value}</p>
    </div>
  );
}

// Read-only Build assets surfaced inside a Grow mission.
export function EquippedList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">EQUIPPED FROM BUILD</div>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <CopyBlock key={item.key} label={item.label} value={item.value} />
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Read-only tools from your Build — edit them in BUILD, use them here.
      </p>
    </div>
  );
}