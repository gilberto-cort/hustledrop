import React, { useState } from 'react';
import { Megaphone, Zap, Tag, Users, MapPin, Globe, Check } from 'lucide-react';
import StrategyDrawer from './StrategyDrawer';
import MarketingModule from '../MarketingModule';
import { MISSION_META } from './missionMeta';

// MISSION 06 — LAUNCH YOUR CAMPAIGN. Channel cards built from the generated
// kit (only the ones the generator judged relevant). The user toggles which
// channels they'll actually use and expands previews; LAUNCH MY CAMPAIGN
// persists the selection. Toggling a card never accepts the mission.
function channelsFrom(content) {
  return [
    { key: 'social', label: 'SOCIAL POSTS', Icon: Megaphone, items: content.social_posts },
    { key: 'shortform', label: 'SHORT-FORM', Icon: Zap, items: content.short_form_ideas },
    { key: 'promo', label: 'PROMOTION', Icon: Tag, text: content.simple_promotion },
    content.referral_idea && { key: 'referral', label: 'REFERRALS', Icon: Users, text: content.referral_idea },
    content.local_marketing_idea && { key: 'local', label: 'LOCAL', Icon: MapPin, text: content.local_marketing_idea },
    content.online_marketing_idea && { key: 'online', label: 'ONLINE', Icon: Globe, text: content.online_marketing_idea },
  ].filter(Boolean);
}

export default function MarketingMission({ content, accepted, busy, generating, onGenerate, onConfirm }) {
  const [selected, setSelected] = useState(null); // Set of channel keys — init below
  const [expanded, setExpanded] = useState(null);
  const [drawer, setDrawer] = useState(false);

  if (!content) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
          A small campaign kit for your customer and offer — only the channels that genuinely fit this business.
        </p>
        <button
          onClick={onGenerate}
          disabled={generating}
          className="mt-4 w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {generating ? 'PLANNING…' : MISSION_META.marketing.generate}
        </button>
      </div>
    );
  }

  const channels = channelsFrom(content);
  const chosen =
    selected ||
    new Set(Array.isArray(content.selected_channels) ? content.selected_channels : channels.map((c) => c.key));
  const isSelected = (key) => chosen.has(key);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-primary/30 bg-brand-gradient-soft p-4 text-center">
        <div className="font-mono text-[9px] font-bold tracking-widest text-primary">CORE MESSAGE</div>
        <p className="mt-1.5 text-sm font-semibold leading-relaxed text-foreground">{content.core_message}</p>
      </div>

      <div className="space-y-2.5">
        {channels.map((c) => {
          const isOpen = expanded === c.key;
          const on = isSelected(c.key);
          return (
            <div
              key={c.key}
              className={`rounded-xl border p-3.5 transition ${
                on ? 'border-primary/50 bg-brand-gradient-soft' : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                    on ? 'border-primary/50 text-primary' : 'border-white/15 text-foreground/70'
                  }`}
                >
                  <c.Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs font-bold tracking-wider text-foreground">{c.label}</span>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {c.items ? `${c.items.length} ready-to-use pieces` : '1 campaign asset'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const next = new Set(chosen);
                    if (on) next.delete(c.key);
                    else next.add(c.key);
                    setSelected(next);
                  }}
                  aria-pressed={on}
                  aria-label={`${on ? 'Remove' : 'Use'} ${c.label}`}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${
                    on ? 'border-primary/60 bg-primary/10 text-primary' : 'border-white/15 text-muted-foreground'
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
              <button
                onClick={() => setExpanded(isOpen ? null : c.key)}
                aria-expanded={isOpen}
                className="mt-2 font-mono text-[9px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
              >
                {isOpen ? '− HIDE PREVIEW' : '+ PREVIEW'}
              </button>
              {isOpen && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-1 space-y-1.5 duration-300 motion-reduce:animate-none">
                  {c.items
                    ? c.items.map((it, i) => (
                        <div key={i} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-[11px] leading-relaxed text-foreground/90">
                          {it}
                        </div>
                      ))
                    : c.text && (
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-[11px] leading-relaxed text-foreground/90">
                          {c.text}
                        </div>
                      )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!accepted && (
        <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-4">
          <button
            onClick={() => onConfirm({ selected_channels: [...chosen] })}
            disabled={chosen.size === 0 || busy}
            className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
          >
            {busy ? 'LAUNCHING…' : 'LAUNCH MY CAMPAIGN'}
          </button>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
            Saves your selected channels and campaign assets — you can adjust them anytime.
          </p>
        </div>
      )}

      <button
        onClick={() => setDrawer(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
      >
        VIEW FULL CAMPAIGN KIT
      </button>
      <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 06 · FULL CAMPAIGN KIT">
        <MarketingModule content={content} />
      </StrategyDrawer>
    </div>
  );
}