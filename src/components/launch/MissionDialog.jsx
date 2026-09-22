import React, { useRef, useState } from 'react';
import { Copy, Check, Crown } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  missionRecommendations, buildLoadoutItems, MISSION_EQUIPPED, PRIMARY_CTA,
} from '@/lib/launchService';
import ProspectRoster from './ProspectRoster';
import ProspectForm from './ProspectForm';
import AskHustleDrop from '@/components/builder/AskHustleDrop';

const MISSION_EXAMPLES = [
  'Who should I reach out to first?',
  'What do I say after they reply?',
  'How do I handle silence after outreach?',
];

const MISSION_DESC =
  'Advice for this mission — HustleDrop knows your business, equipped assets and HustleDNA. Advice only: it never changes your content.';

// A Mission screen — an RPG quest panel over REAL actions. Equipped tools
// are read-only assets from the user's accepted Build modules; Build stays
// the only place they are edited.
export default function MissionDialog({
  def, prospects, accepted, dna, busy, onClose, onAddProspect, onAdvance, onAskUsed,
}) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const rosterRef = useRef(null);
  if (!def) return null;

  const recs = missionRecommendations(accepted, dna);
  const allItems = buildLoadoutItems(accepted);
  const equipped = (MISSION_EQUIPPED[def.type] || [])
    .map((k) => allItems.find((i) => i.key === k))
    .filter(Boolean);

  const isMiniBoss = def.type === 'first_contact';
  const isFinal = def.type === 'first_customer';
  const primaryCta = PRIMARY_CTA[def.type];

  const copyItem = async (item) => {
    try {
      await navigator.clipboard.writeText(item.value);
      setCopiedKey(item.key);
      setTimeout(() => setCopiedKey(null), 1600);
    } catch (e) {
      // clipboard unavailable — the asset is still readable above
    }
  };

  const handlePrimary = () => {
    if (def.type === 'prospect_hunt') {
      setLogOpen(true);
    } else if (rosterRef.current) {
      rosterRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto border-white/10 bg-card sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2 text-lg font-semibold">
              <span className="font-mono text-xs font-bold text-muted-foreground">
                {isFinal ? 'FINAL QUEST' : isMiniBoss ? 'MINI-BOSS' : `QUEST 0${def.index + 1}`}
              </span>
              {def.title}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="font-mono">
                {'★'.repeat(def.difficulty)}
                {'☆'.repeat(5 - def.difficulty)}
              </span>
              <span>·</span>
              <span>{def.xp > 0 ? `Reward: +${def.xp} XP` : 'Reward: your gear, ready'}</span>
              <span>·</span>
              <span>{def.time}</span>
              <span>·</span>
              <span>{def.cost}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isFinal && (
              <div className="rounded-xl border border-primary/40 bg-brand-gradient-soft p-4 text-center">
                <Crown className="mx-auto h-5 w-5 text-primary" />
                <div className="mt-1 font-mono text-xs font-bold tracking-widest text-primary">
                  FINAL BOSS — BRING IT ALL TOGETHER
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/80">
                  Your offer, price, customer, scripts, follow-ups and channels — everything you built is equipped
                  below. Use it.
                </p>
              </div>
            )}
            {isMiniBoss && (
              <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-center">
                <div className="font-mono text-xs font-bold tracking-widest text-accent">FIRST OUTREACH</div>
                <p className="mt-1.5 text-[11px] italic text-foreground/80">
                  "The hardest message is usually the first one."
                </p>
              </div>
            )}

            <div>
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">MISSION</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">{def.mission}</p>
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">WHY THIS MATTERS</div>
              <p className="mt-1 text-sm leading-relaxed text-foreground/90">{def.why}</p>
            </div>
            {recs.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                  HUSTLEDROP RECOMMENDS
                </div>
                <ul className="mt-1.5 space-y-1.5">
                  {recs.map((r, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {equipped.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                  EQUIPPED FROM BUILD
                </div>
                <div className="mt-2 space-y-2">
                  {equipped.map((item) => (
                    <div key={item.key} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                          {item.label}
                        </span>
                        <button
                          onClick={() => copyItem(item)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40"
                        >
                          {copiedKey === item.key ? (
                            <Check className="h-3 w-3 text-primary" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedKey === item.key ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Read-only tools from your Build — edit them in BUILD, use them here.
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider text-muted-foreground">
                <span>PROGRESS</span>
                <span className="font-mono">
                  {def.current_count} / {def.target}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-gradient transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((def.current_count / def.target) * 100))}%` }}
                />
              </div>
            </div>

            {!def.completed && primaryCta && (
              <button
                onClick={handlePrimary}
                disabled={busy}
                className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
              >
                {primaryCta}
              </button>
            )}

            <div ref={rosterRef}>
              <ProspectRoster prospects={prospects} busy={busy} onAdd={onAddProspect} onAdvance={onAdvance} />
            </div>

            <AskHustleDrop
              onUsed={onAskUsed}
              examples={MISSION_EXAMPLES}
              description={MISSION_DESC}
              placeholder="Ask about this mission…"
            />

            {def.completed && (
              <div className="rounded-xl border-2 border-primary/40 bg-brand-gradient-soft p-4 text-center">
                <div className="font-mono text-xs font-bold tracking-widest text-primary">QUEST COMPLETE</div>
                {def.xp > 0 && <div className="mt-1 font-mono text-sm font-bold text-foreground">+{def.xp} XP</div>}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ProspectForm
        open={logOpen}
        busy={busy}
        onClose={() => setLogOpen(false)}
        onSubmit={onAddProspect}
      />
    </>
  );
}