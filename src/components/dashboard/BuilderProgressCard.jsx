import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';

// Dashboard builder card — progress counts accepted modules only.
export default function BuilderProgressCard({ percent, started }) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
          <Hammer className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">BUSINESS BUILDER</span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">
          {started ? `${percent}% COMPLETE` : 'Ready to build'}
        </h3>
        <span className="text-[10px] text-muted-foreground">counts accepted modules only</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-brand-gradient transition-all duration-500" style={{ width: `${percent}%` }} />
      </div>
      <Link
        to="/build"
        className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
      >
        CONTINUE BUILDING
      </Link>
    </div>
  );
}