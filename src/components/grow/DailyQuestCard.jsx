import React from 'react';

// DAILY QUEST — one optional quest derived from the user's real bottleneck.
// +25 XP, once per day (date-gated server-side).
export default function DailyQuestCard({ quest, completedToday, busy, onComplete }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">DAILY QUEST</span>
        <span className="font-mono text-[10px] font-bold text-primary">+{quest.xp} XP</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{quest.title}</p>
      {completedToday ? (
        <div className="mt-3 rounded-full border border-primary/40 bg-brand-gradient-soft px-3 py-2 text-center font-mono text-[10px] font-bold tracking-widest text-primary">
          COMPLETE — SEE YOU TOMORROW
        </div>
      ) : (
        <button
          onClick={onComplete}
          disabled={busy}
          className="mt-3 w-full rounded-full border border-white/15 py-2.5 text-xs font-bold tracking-wider text-foreground transition hover:border-primary/40 disabled:opacity-40"
        >
          {busy ? 'SAVING…' : 'MARK DONE'}
        </button>
      )}
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Real-world business actions only — the quest follows your bottleneck, not an engagement metric.
      </p>
    </div>
  );
}