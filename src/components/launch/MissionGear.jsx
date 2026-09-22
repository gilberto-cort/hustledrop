import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { buildLoadoutItems, MISSION_EQUIPPED } from '@/lib/launchService';

// Read-only Build assets equipped for this mission — one tap to copy, never
// edited here (BUILD stays the only place they change).
export default function MissionGear({ accepted, missionType }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const all = buildLoadoutItems(accepted);
  const equipped = (MISSION_EQUIPPED[missionType] || [])
    .map((k) => all.find((i) => i.key === k))
    .filter(Boolean);
  if (equipped.length === 0) {
    return <p className="text-xs text-muted-foreground">No extra gear needed for this quest.</p>;
  }
  const copy = async (item) => {
    try {
      await navigator.clipboard.writeText(item.value);
      setCopiedKey(item.key);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch (e) {
      // clipboard unavailable — the asset is still readable above
    }
  };
  return (
    <div className="space-y-2">
      {equipped.map((item) => (
        <div key={item.key} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-bold tracking-wider text-muted-foreground">{item.label}</span>
            <button
              onClick={() => copy(item)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40"
            >
              {copiedKey === item.key ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copiedKey === item.key ? 'COPIED' : 'COPY'}
            </button>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{item.value}</p>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground">Read-only tools from your Build — edit them in BUILD, use them here.</p>
    </div>
  );
}