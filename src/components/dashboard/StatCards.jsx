import React from 'react';

// Compact, glanceable progress — real persisted numbers only, no analytics
// overload. One row that scrolls on the narrowest screens.
export default function StatCards({ level, xp, questStage, buildPercent, customers, achievements }) {
  const cards = [
    { label: 'LEVEL + XP', value: level ? `LV.${level} · ${xp || 0}` : '—' },
    { label: 'CURRENT QUEST', value: questStage ? questStage.replace(/_/g, ' ').toUpperCase() : 'NOT STARTED' },
    { label: 'BUILD PROGRESS', value: `${buildPercent || 0}%` },
    { label: 'CUSTOMERS', value: String(customers || 0) },
    { label: 'ACHIEVEMENTS', value: String(achievements || 0) },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="text-[9px] font-bold tracking-wider text-muted-foreground">{c.label}</div>
          <div className="mt-1 truncate font-mono text-sm font-bold text-foreground">{c.value}</div>
        </div>
      ))}
    </div>
  );
}