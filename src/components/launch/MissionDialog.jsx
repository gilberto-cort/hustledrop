import React, { useState } from 'react';
import { Copy, Check, Crown } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { missionRecommendations } from '@/lib/launchService';
import ProspectRoster from './ProspectRoster';

// A Mission screen — the real action lives in the roster: no meaningless
// "mark complete" buttons. Recommendations come from the user's accepted
// Build modules, adapted to their HustleDNA.
export default function MissionDialog({
  def, prospects, accepted, dna, busy, onClose, onAddProspect, onAdvance,
}) {
  const [copied, setCopied] = useState(false);
  if (!def) return null;

  const sales = accepted.sales || {};
  const offer = accepted.offer || {};
  const pricing = accepted.pricing || {};
  const marketing = accepted.marketing || {};
  const recs = missionRecommendations(accepted, dna);

  const isMiniBoss = def.type === 'first_contact';
  const isFinal = def.type === 'first_customer';
  const script = def.type === 'first_contact'
    ? sales.dm_script
    : def.type === 'follow_up'
      ? sales.follow_up_1
      : null;

  const copyScript = async () => {
    if (!script) return;
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {}
  };

  return (
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
                BRING IT ALL TOGETHER
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/80">
                Your offer, price, customer, scripts, follow-ups and channels — everything you built is in your
                Loadout. Use it.
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
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">HUSTLEDROP RECOMMENDS</div>
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

          {script && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
                  {def.type === 'first_contact' ? 'YOUR OUTREACH SCRIPT' : 'YOUR FOLLOW-UP SCRIPT'}
                </span>
                <button
                  onClick={copyScript}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40"
                >
                  {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'COPIED' : 'COPY SCRIPT'}
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{script}</p>
            </div>
          )}

          {isFinal && (offer.name || pricing.test_price || sales.common_objection) && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">AT THE TABLE</div>
              <ul className="mt-2 space-y-1 text-xs text-foreground/80">
                {offer.name && <li>OFFER: {offer.name}</li>}
                {pricing.test_price && <li>PRICE: {pricing.test_price} (a hypothesis — test it)</li>}
                {sales.common_objection && (
                  <li>
                    LIKELY OBJECTION: {sales.common_objection} → {sales.objection_response}
                  </li>
                )}
                {marketing.core_message && <li>CORE MESSAGE: {marketing.core_message}</li>}
              </ul>
            </div>
          )}

          <ProspectRoster prospects={prospects} busy={busy} onAdd={onAddProspect} onAdvance={onAdvance} />

          {def.completed && (
            <div className="rounded-xl border-2 border-primary/40 bg-brand-gradient-soft p-4 text-center">
              <div className="font-mono text-xs font-bold tracking-widest text-primary">QUEST COMPLETE</div>
              {def.xp > 0 && <div className="mt-1 font-mono text-sm font-bold text-foreground">+{def.xp} XP</div>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}