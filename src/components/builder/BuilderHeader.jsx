import React from 'react';

// Builder header: selected business, Personal Fit, HustleDNA code and
// progress from ACCEPTED modules only (generated-but-unaccepted doesn't count).
export default function BuilderHeader({ businessName, fit, hustleCode, percent }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">BUSINESS BUILDER</div>
      <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">{businessName}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {fit != null && (
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] font-bold text-foreground">
            {fit}% PERSONAL FIT
          </span>
        )}
        {hustleCode && (
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] font-bold text-foreground">
            DNA {hustleCode}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground">
          <span>PROGRESS — ACCEPTED MODULES</span>
          <span>{percent}% COMPLETE</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-brand-gradient transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}