import React from 'react';
import { BadgeCheck, FileText, RotateCcw } from 'lucide-react';
import { Chip, Note } from './builderKit';

// Standard chrome around each generated module: number, label, status,
// REVIEW RECOMMENDED flag and the KEEP IT / TRY ANOTHER / EDIT action bar.
export default function ModulePanel({ num, label, desc, status, reviewNeeded, children, actions, extra }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-muted-foreground">{num}</span>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{label}</h2>
          </div>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">{desc}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {status === 'accepted' && (
            <Chip tone="primary">
              <BadgeCheck className="mr-1 inline h-3 w-3" />
              ACCEPTED
            </Chip>
          )}
          {status === 'draft' && (
            <Chip>
              <FileText className="mr-1 inline h-3 w-3" />
              DRAFT
            </Chip>
          )}
          {reviewNeeded && <Chip tone="warn">REVIEW RECOMMENDED</Chip>}
        </div>
      </div>

      <div className="mt-5 space-y-4">{children}</div>
      {extra}
      {actions && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              disabled={a.disabled}
              className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold tracking-wider transition disabled:opacity-40 ${
                a.primary
                  ? 'bg-brand-gradient text-white hover:scale-[1.02]'
                  : 'border border-white/15 text-foreground hover:border-white/30'
              }`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
      )}
      {reviewNeeded && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
          <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400" />
          <Note>
            An upstream module you accepted has changed since this was generated. It still works — but reviewing it is
            recommended before you act on it.
          </Note>
        </div>
      )}
    </div>
  );
}