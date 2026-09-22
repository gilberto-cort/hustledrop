import React, { useState } from 'react';
import { Palette, Check, Sparkles, Crown } from 'lucide-react';
import StrategyDrawer from './StrategyDrawer';
import BrandModule from '../BrandModule';
import { MISSION_META } from './missionMeta';

// MISSION 04 — CREATE YOUR IDENTITY. Stage 1: five selectable name cards —
// one tap SELECTS, USE THIS NAME confirms and generates the identity stage.
// Stage 2: visual identity cards (tagline, positioning, personality, color
// swatches, style) — MAKE MY BRAND confirms and accepts. Nothing is accepted
// by a card tap alone.
const IDENTITY_CARDS = [
  { key: 'tagline', label: 'TAGLINE' },
  { key: 'one_sentence_positioning', label: 'POSITIONING' },
  { key: 'brand_personality', label: 'PERSONALITY' },
  { key: 'visual_style', label: 'VISUAL STYLE' },
  { key: 'short_bio', label: 'BIO' },
  { key: 'customer_facing_description', label: 'HOW YOU DESCRIBE IT' },
];

function hexSwatches(text) {
  return (String(text || '').match(/#[0-9a-fA-F]{6}/g) || []).slice(0, 5);
}

export default function BrandMission({ content, accepted, busy, generating, brandPicking, onGenerate, onConfirm, onPickName, onManualName }) {
  const [picked, setPicked] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualName, setManualName] = useState('');

  // No content yet — generate name options first.
  if (!content) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground">
          Five name options for your business, suited to your locked-in customer and offer.
        </p>
        <button
          onClick={() => onGenerate()}
          disabled={generating}
          className="mt-4 w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {generating ? 'NAMING…' : MISSION_META.brand.generate}
        </button>
        <div className="mt-2.5 border-t border-white/10 pt-3">
          <button
            onClick={() => setManual((m) => !m)}
            className="text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            {manual ? 'HIDE MANUAL ENTRY' : 'AI UNAVAILABLE? TYPE MY OWN NAME'}
          </button>
          {manual && (
            <div className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Your business name"
                maxLength={60}
                aria-label="Your business name"
                className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
              />
              <button
                onClick={() => manualName.trim() && onManualName(manualName.trim())}
                disabled={!manualName.trim() || brandPicking}
                className="shrink-0 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-[10px] font-bold tracking-widest text-primary transition hover:bg-primary/20 disabled:opacity-40"
              >
                {brandPicking ? 'SAVING…' : 'SAVE NAME'}
              </button>
            </div>
          )}
          <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
            Saving your own name skips AI naming — you confirm it yourself on the next screen.
          </p>
        </div>
      </div>
    );
  }

  // STAGE 1 — selectable name cards.
  if (Array.isArray(content.name_options)) {
    return (
      <div className="space-y-3">
        <div className="space-y-2.5">
          {content.name_options.map((opt, i) => {
            const isPicked = picked === i;
            return (
              <button
                key={i}
                onClick={() => setPicked(isPicked ? null : i)}
                aria-pressed={isPicked}
                className={`w-full rounded-xl border p-4 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isPicked
                    ? 'border-primary/60 bg-brand-gradient-soft'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-foreground">{opt.name}</span>
                  {isPicked && (
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-widest text-primary">
                      <Check className="h-3 w-3" />
                      MINE
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{opt.positioning}</p>
              </button>
            );
          })}
        </div>
        <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-4">
          <button
            onClick={() => picked !== null && onPickName(content.name_options[picked].name)}
            disabled={picked === null || brandPicking}
            className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
          >
            {brandPicking ? 'FORGING IDENTITY…' : 'USE THIS NAME'}
          </button>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
            Confirming the name forges your full identity kit next. Verify domain and trademark availability before
            committing.
          </p>
          {picked !== null && (
            <button
              onClick={() => onManualName(content.name_options[picked].name)}
              disabled={brandPicking}
              className="w-full text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground disabled:opacity-40"
            >
              IDENTITY KIT WON’T FORGE? SAVE MY PICKED NAME ONLY
            </button>
          )}
        </div>
      </div>
    );
  }

  // STAGE 2 / LOCKED-IN — the identity kit as visual cards.
  const isAccepted = accepted;
  const swatches = hexSwatches(content.color_direction);
  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-primary/40 bg-brand-gradient-soft p-4 text-center">
        <div className="flex items-center justify-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-primary">
          <Crown className="h-3 w-3" />
          {isAccepted ? 'YOUR BRAND' : 'CHOSEN NAME'}
        </div>
        <div className="mt-1 text-2xl font-bold tracking-tight text-foreground">{content.chosen_name || 'YOUR BUSINESS NAME'}</div>
        {content.tagline && <p className="mt-1 text-xs italic text-muted-foreground">“{content.tagline}”</p>}
      </div>

      {swatches.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
            <Palette className="h-3 w-3" />
            COLOR DIRECTION
          </div>
          <div className="mt-2 flex gap-2">
            {swatches.map((hex) => (
              <span
                key={hex}
                className="h-8 w-8 rounded-lg border border-white/20"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{content.color_direction}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {IDENTITY_CARDS.filter((card) => content[card.key]).map((card) => (
          <div key={card.key} className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
            <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">{card.label}</div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/90">{content[card.key]}</p>
          </div>
        ))}
      </div>

      {!isAccepted && (
        <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-4">
          <button
            onClick={() => onConfirm()}
            disabled={busy}
            className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
          >
            {busy ? 'SAVING…' : 'MAKE IT MY BRAND'}
          </button>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
            Saves this identity as your brand. No logo is generated and no availability is claimed.
          </p>
        </div>
      )}

      {content.manual ? (
        <p className="rounded-lg border border-dashed border-white/15 p-2.5 text-center text-[10px] leading-relaxed text-muted-foreground">
          You saved this name yourself — no AI brand kit was generated for it.
        </p>
      ) : (
        <button
          onClick={() => setDrawer(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
        >
          VIEW FULL BRAND KIT
        </button>
      )}
      <p className="flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
        Verify business-name, domain and trademark availability before committing.
      </p>
      <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 04 · FULL BRAND KIT">
        <BrandModule content={content} picking={brandPicking} />
      </StrategyDrawer>
    </div>
  );
}