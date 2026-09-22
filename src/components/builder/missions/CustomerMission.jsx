import React, { useState } from 'react';
import { Users, Home, Building2, ChevronDown, Check, Sparkles } from 'lucide-react';
import StrategyDrawer from './StrategyDrawer';
import CustomerModule from '../CustomerModule';
import { MISSION_META } from './missionMeta';

// MISSION 01 — FIND YOUR CROWD. Three visual candidate-crowd cards; tapping
// only EXPANDS a card (compare mode, one at a time). Locking in requires an
// explicit SELECT + LOCK IN MY TARGET confirmation, which persists the chosen
// target into the accepted Customer asset. Never auto-accepts on tap, and
// never presents AI segments as verified demand.
const SEGMENT_ICONS = [Users, Home, Building2];

function shortLabel(who) {
  const first = String(who || '').split(/[,.—–]/)[0].trim();
  return first.length > 28 ? `${first.slice(0, 28)}…` : first || 'SEGMENT';
}

const REACH_STYLE = {
  HIGH: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  MEDIUM: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  LOW: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
};

function Detail({ label, text }) {
  return (
    <div>
      <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">{label}</div>
      <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">{text}</p>
    </div>
  );
}

export default function CustomerMission({ content, accepted, busy, generating, onGenerate, onConfirm }) {
  const [expanded, setExpanded] = useState(null);
  const [picked, setPicked] = useState(null);
  const [drawer, setDrawer] = useState(false);

  // No generated segments yet — the first actionable choice is to scout.
  if (!content) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
          We’ll scout three realistic candidate crowds for this business — matched to your budget, hours and
          location. They arrive as hypotheses to test, not verified demand.
        </p>
        <button
          onClick={() => onGenerate()}
          disabled={generating}
          className="mt-4 w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {generating ? 'SCOUTING…' : MISSION_META.customer.generate}
        </button>
      </div>
    );
  }

  const segments = content.segments || [];
  const best = typeof content.best_first_index === 'number' ? content.best_first_index : -1;
  const lockedIndex =
    typeof content.selected_segment_index === 'number' ? content.selected_segment_index : accepted ? best : -1;

  // LOCKED-IN state — their previously accepted choice maps straight in.
  if (accepted && lockedIndex >= 0 && segments[lockedIndex]) {
    const s = segments[lockedIndex];
    const Icon = SEGMENT_ICONS[lockedIndex % 3];
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-primary/40 bg-brand-gradient-soft p-4">
          <div className="font-mono text-[9px] font-bold tracking-widest text-primary">YOUR TARGET CROWD</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/40 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{shortLabel(s.who)}</p>
              <span
                className={`mt-1 inline-block rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold tracking-wider ${
                  REACH_STYLE[s.ease_of_reach] || ''
                }`}
              >
                {s.ease_of_reach} REACH
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setDrawer(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
        >
          VIEW FULL STRATEGY
        </button>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Locked in. TRY ANOTHER scouts new segments — your current target stays saved until you confirm a new one.
        </p>
        <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 01 · FULL CUSTOMER STRATEGY">
          <CustomerModule content={content} />
        </StrategyDrawer>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {segments.map((s, i) => {
          const Icon = SEGMENT_ICONS[i % 3];
          const isOpen = expanded === i;
          const isPicked = picked === i;
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => setExpanded(isOpen ? null : i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpanded(isOpen ? null : i);
                }
              }}
              className={`w-full cursor-pointer rounded-xl border p-3.5 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isPicked
                  ? 'border-primary/60 bg-brand-gradient-soft'
                  : isOpen
                    ? 'border-white/25 bg-white/[0.04]'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                    isPicked ? 'border-primary/50 text-primary' : 'border-white/15 text-foreground/70'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-foreground">{shortLabel(s.who)}</span>
                    {i === best && (
                      <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-primary">
                        BEST TO TEST
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.problem}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={`rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold tracking-wider ${
                      REACH_STYLE[s.ease_of_reach] || ''
                    }`}
                  >
                    {s.ease_of_reach} REACH
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-muted-foreground transition-transform motion-reduce:transition-none ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1 space-y-2.5 border-t border-white/10 pt-3 duration-300 motion-reduce:animate-none">
                  <Detail label="ADVANTAGES" text={s.why_buy} />
                  <Detail label="THE CHALLENGE" text={s.problem} />
                  <Detail label="WHERE TO FIND THEM" text={s.where_to_find} />
                  <Detail
                    label="PRACTICAL FIRST TEST"
                    text="Reach out to 3 people from this group this week and ask about the problem above — that is the real test."
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPicked(isPicked ? null : i);
                    }}
                    className={`w-full rounded-full border py-2 text-[10px] font-bold tracking-widest transition ${
                      isPicked
                        ? 'border-primary/60 bg-primary/10 text-primary'
                        : 'border-white/15 text-foreground/80 hover:border-primary/40'
                    }`}
                  >
                    {isPicked ? '✓ SELECTED AS MY TARGET' : 'SELECT AS MY TARGET'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-4">
        <button
          onClick={() => onConfirm({ selected_segment_index: picked, selected_segment: shortLabel(segments[picked].who) })}
          disabled={picked === null || busy}
          className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
        >
          {busy ? 'LOCKING IN…' : 'LOCK IN MY TARGET'}
        </button>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
          Locking in saves this crowd as your customer target — you can change it later.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          These segments are generated hypotheses — not verified demand. Test with real people before committing.
          <button onClick={() => setDrawer(true)} className="ml-1 font-bold text-primary underline-offset-2 hover:underline">
            VIEW FULL STRATEGY
          </button>
        </p>
      </div>

      <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 01 · FULL CUSTOMER STRATEGY">
        <CustomerModule content={content} />
      </StrategyDrawer>
    </div>
  );
}