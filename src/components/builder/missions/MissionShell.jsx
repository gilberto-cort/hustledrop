import React from 'react';
import { BadgeCheck, FileText, RotateCcw, Pencil, Trophy } from 'lucide-react';

// Mission chrome: quest number, title, short objective, status chip and the
// shared TRY ANOTHER / REFINE ghost actions. The primary confirm action is
// always mission-specific and rendered by the mission itself — never a
// generic "accept" button.
export default function MissionShell({
  num,
  title,
  objective,
  status,
  reviewNeeded,
  justAccepted,
  onRegenerate,
  onEdit,
  regenerating,
  children,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary">MISSION {num}</div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">{objective}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {justAccepted ? (
            <span className="inline-flex animate-in fade-in slide-in-from-bottom-2 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-primary duration-500 motion-reduce:animate-none">
              <Trophy className="h-3 w-3" />
              MISSION COMPLETE · +50 XP
            </span>
          ) : status === 'accepted' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-primary">
              <BadgeCheck className="h-3 w-3" />
              LOCKED IN
            </span>
          ) : status === 'draft' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
              <FileText className="h-3 w-3" />
              DRAFT
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-4">{children}</div>

      {(onRegenerate || onEdit) && (
        <div className="mt-5 flex flex-wrap gap-2.5">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={regenerating}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              TRY ANOTHER
            </button>
          )}
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40"
            >
              <Pencil className="h-3.5 w-3.5" />
              REFINE
            </button>
          )}
        </div>
      )}

      {reviewNeeded && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
          <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            An upstream mission you locked in has changed since this was generated. It still works — but reviewing it
            is recommended before you act on it.
          </p>
        </div>
      )}
    </div>
  );
}