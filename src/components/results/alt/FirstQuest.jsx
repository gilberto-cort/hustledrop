import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

// FIRST QUEST — the model's real validation action framed as the path's first
// experiment. XP is only ever earned through real launch progression; opening
// this card or choosing the path earns nothing by itself.
export default function FirstQuest({ match, isCurrent, busy, onSelect, onClose }) {
  const action = match.model.first_validation_action;
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">FIRST QUEST</div>
      <div className="mt-1.5 text-sm font-semibold text-foreground">PROVE THE IDEA</div>
      {action && <p className="mt-1.5 text-xs leading-relaxed text-foreground/85">{action}</p>}
      <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">
        QUEST REWARD — XP is earned in Launch Mode only when real quests for this path are completed.
      </p>

      {isCurrent ? (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 py-2.5 font-mono text-[11px] font-bold tracking-widest text-primary">
            <Check className="h-3.5 w-3.5" /> CURRENT PATH
          </div>
          <Link
            to="/dashboard"
            onClick={onClose}
            className="block w-full rounded-full bg-brand-gradient py-3 text-center text-sm font-bold tracking-wider text-white transition hover:scale-[1.01]"
          >
            CONTINUE TO DASHBOARD
          </Link>
          <button
            onClick={onClose}
            className="w-full rounded-full border border-white/15 py-2.5 text-center text-xs font-semibold text-muted-foreground transition hover:text-foreground"
          >
            EXPLORE ANOTHER MATCH
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => onSelect(match)}
            disabled={busy}
            className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
          >
            {busy ? 'CHOOSING…' : 'CHOOSE THIS PATH'}
          </button>
          <p className="mt-2.5 text-center text-[10px] leading-relaxed text-muted-foreground">
            You can change your selected business before purchasing the Builder.
          </p>
        </div>
      )}
    </section>
  );
}