import React, { useState } from 'react';
import { Package, ChevronDown, Check, Plus } from 'lucide-react';
import StrategyDrawer from './StrategyDrawer';
import OfferModule from '../OfferModule';
import { MISSION_META } from './missionMeta';

// MISSION 02 — FORGE YOUR OFFER. Three package cards; expand to compare, pick
// one, then CUSTOMIZE it: toggle what's included and add one custom touch.
// Confirmation (SET MY OFFER) persists the choice + customization. Tapping a
// card never accepts anything by itself.
export default function OfferMission({ content, accepted, busy, generating, onGenerate, onConfirm }) {
  const [expanded, setExpanded] = useState(null);
  const [picked, setPicked] = useState(null);
  const [kept, setKept] = useState({}); // { offerIndex: Set of included items kept }
  const [addition, setAddition] = useState('');
  const [drawer, setDrawer] = useState(false);

  if (!content) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
          We’ll forge three offer packages built around your locked-in customer — each simple, testable and inside
          your budget.
        </p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="mt-4 w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {generating ? 'FORGING…' : MISSION_META.offer.generate}
        </button>
      </div>
    );
  }

  const offers = content.offers || [];
  const rec = typeof content.recommended_index === 'number' ? content.recommended_index : -1;
  const chosen = typeof content.selected_offer_index === 'number' ? content.selected_offer_index : accepted ? rec : -1;

  if (accepted && chosen >= 0 && offers[chosen]) {
    const o = offers[chosen];
    const keptList = Array.isArray(content.customized_included) ? content.customized_included : o.included || [];
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-primary/40 bg-brand-gradient-soft p-4">
          <div className="font-mono text-[9px] font-bold tracking-widest text-primary">YOUR OFFER</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/40 text-primary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{o.name}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{o.core_outcome}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">WHAT’S INCLUDED</div>
          <ul className="mt-2 space-y-1.5">
            {keptList.map((it, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/90">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                {it}
              </li>
            ))}
          </ul>
          {content.custom_addition && (
            <p className="mt-2 rounded-lg border border-dashed border-primary/30 p-2 text-[11px] text-primary">
              + {content.custom_addition}
            </p>
          )}
        </div>
        <button
          onClick={() => setDrawer(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
        >
          VIEW FULL STRATEGY
        </button>
        <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 02 · FULL OFFER STRATEGY">
          <OfferModule content={content} />
        </StrategyDrawer>
      </div>
    );
  }

  const keptFor = (i) => kept[i] || new Set((offers[i].included || []).map((_, k) => k));

  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {offers.map((o, i) => {
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
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-bold text-foreground">{o.name}</span>
                    {i === rec && (
                      <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-wider text-primary">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{o.core_outcome}</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {isOpen && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1 space-y-2.5 border-t border-white/10 pt-3 duration-300 motion-reduce:animate-none">
                  <div>
                    <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
                      THE CUSTOMER GETS
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">{o.customer_gets}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">DELIVERY</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">{o.delivery_method}</p>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">EFFORT</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">{o.delivery_effort}</p>
                  </div>

                  {isPicked && (
                    <div
                      className="rounded-lg border border-primary/25 bg-white/[0.02] p-3"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-primary">
                        <Plus className="h-3 w-3" />
                        CUSTOMIZE YOUR PACKAGE
                      </div>
                      <div className="mt-2 space-y-1">
                        {(o.included || []).map((it, k) => {
                          const on = keptFor(i).has(k);
                          return (
                            <label key={k} className="flex cursor-pointer items-start gap-2 text-[11px] text-foreground/90">
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => {
                                  const next = new Set(keptFor(i));
                                  if (on) next.delete(k);
                                  else next.add(k);
                                  setKept((prev) => ({ ...prev, [i]: next }));
                                }}
                                className="mt-0.5 h-3.5 w-3.5 accent-primary"
                              />
                              {it}
                            </label>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        value={addition}
                        onChange={(e) => setAddition(e.target.value)}
                        placeholder="One extra touch you\u2019d add (optional)"
                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
                      />
                    </div>
                  )}

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
                    {isPicked ? '✓ MY PICK' : 'PICK THIS PACKAGE'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-4">
        <button
          onClick={() => {
            const items = [...keptFor(picked)];
            onConfirm({
              selected_offer_index: picked,
              selected_offer: offers[picked].name,
              customized_included: items.map((k) => offers[picked].included[k]),
              custom_addition: addition.trim() || null,
            });
          }}
          disabled={picked === null || busy}
          className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
        >
          {busy ? 'SETTING…' : 'SET MY OFFER'}
        </button>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
          Saves the package — including your customizations — as your offer.
        </p>
      </div>

      <button
        onClick={() => setDrawer(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
      >
        VIEW FULL STRATEGY
      </button>
      <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 02 · FULL OFFER STRATEGY">
        <OfferModule content={content} />
      </StrategyDrawer>
    </div>
  );
}