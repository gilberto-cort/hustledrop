import React, { useState } from 'react';
import { MessageCircle, Mail, Users, ChevronDown, Swords } from 'lucide-react';
import StrategyDrawer from './StrategyDrawer';
import SalesModule from '../SalesModule';
import { MISSION_META } from './missionMeta';

// MISSION 05 — EQUIP YOUR PITCH. A distinct interaction: choose a pitch TONE
// (sent to generation so the kit is written in it), pick your primary channel,
// preview the scripts, and run a lightweight practice round against the
// generated objection using pieces of your own kit. EQUIP MY PITCH confirms.
const TONES = [
  { key: 'friendly', label: 'WARM & FRIENDLY', desc: 'Casual, human, low-pressure.' },
  { key: 'direct', label: 'DIRECT & CLEAR', desc: 'Short and to the point — never pushy.' },
  { key: 'value', label: 'VALUE FIRST', desc: 'Lead with what they get before asking.' },
];

function toneLabel(key) {
  const t = TONES.find((x) => x.key === key);
  return t ? t.label : 'WARM & FRIENDLY';
}

export default function SalesMission({ content, accepted, busy, generating, onGenerate, onConfirm }) {
  const [tone, setTone] = useState('friendly');
  const [channel, setChannel] = useState(null);
  const [practiceReply, setPracticeReply] = useState(null);
  const [drawer, setDrawer] = useState(false);

  // No kit yet — the first actionable choice is the pitch tone.
  if (!content) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-5">
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Choose your pitch tone — your first-customer kit is written in it.
          </p>
          <div className="mt-4 space-y-2">
            {TONES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTone(t.key)}
                aria-pressed={tone === t.key}
                className={`w-full rounded-xl border p-3.5 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  tone === t.key
                    ? 'border-primary/60 bg-brand-gradient-soft'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <span className="font-mono text-xs font-bold tracking-wider text-foreground">{t.label}</span>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => onGenerate({ tone })}
          disabled={generating}
          className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {generating ? 'FORGING…' : MISSION_META.sales.generate}
        </button>
      </div>
    );
  }

  const activeTone = content.chosen_tone || tone;
  const channels = [
    { key: 'dm', label: 'DM / TEXT', Icon: MessageCircle, text: content.dm_script },
    { key: 'email', label: 'EMAIL', Icon: Mail, text: content.email_script },
    content.in_person_script && { key: 'in_person', label: 'IN-PERSON', Icon: Users, text: content.in_person_script },
  ].filter(Boolean);
  const activeChannel = channel || content.primary_channel || channels[0].key;
  const current = channels.find((c) => c.key === activeChannel) || channels[0];
  const replies = [
    { key: 'objection', label: 'ANSWER THE OBJECTION', text: content.objection_response },
    { key: 'close', label: 'SOFT CLOSE', text: content.soft_close },
    { key: 'follow', label: 'GENTLE FOLLOW-UP', text: content.follow_up_1 },
  ].filter((r) => r.text);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-primary">
          TONE: {toneLabel(activeTone)}
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-muted-foreground">
          INTRO: {content.introduction}
        </span>
      </div>

      {/* Channel selector + live script preview */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-1.5">
          {channels.map((c) => (
            <button
              key={c.key}
              onClick={() => setChannel(c.key)}
              aria-pressed={activeChannel === c.key}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[9px] font-bold tracking-wider transition ${
                activeChannel === c.key
                  ? 'border-primary/60 bg-primary/10 text-primary'
                  : 'border-white/15 text-muted-foreground hover:text-foreground'
              }`}
            >
              <c.Icon className="h-3 w-3" />
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3.5">
          <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
            {current.label} PREVIEW
          </div>
          <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-foreground/90">{current.text}</p>
        </div>
      </div>

      {/* Lightweight practice round against the generated objection */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-1.5">
          <Swords className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] font-bold tracking-widest text-primary">PRACTICE ROUND</span>
        </div>
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <div className="font-mono text-[8px] font-bold tracking-widest text-muted-foreground">A CUSTOMER SAYS…</div>
          <p className="mt-1 text-xs leading-relaxed text-foreground/90">{content.common_objection}</p>
        </div>
        <div className="mt-2.5 space-y-1.5">
          {replies.map((r, i) => (
            <div key={r.key}>
              <button
                onClick={() => setPracticeReply(practiceReply === i ? null : i)}
                aria-expanded={practiceReply === i}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-left transition hover:border-primary/40"
              >
                <span className="font-mono text-[9px] font-bold tracking-wider text-foreground/85">{r.label}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform motion-reduce:transition-none ${
                    practiceReply === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {practiceReply === i && (
                <p className="mt-1.5 animate-in fade-in slide-in-from-top-1 rounded-lg border border-primary/25 bg-brand-gradient-soft p-3 text-xs leading-relaxed text-foreground/90 duration-300 motion-reduce:animate-none">
                  {r.text}
                  <span className="mt-2 block text-[10px] text-muted-foreground">
                    Say it in your own words — real conversations aren’t scripts.
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {!accepted && (
        <div className="rounded-2xl border border-primary/25 bg-brand-gradient-soft p-4">
          <button
            onClick={() => onConfirm({ chosen_tone: activeTone, primary_channel: activeChannel })}
            disabled={busy}
            className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
          >
            {busy ? 'EQUIPPING…' : 'EQUIP MY PITCH'}
          </button>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground">
            Saves your tone and primary channel with the kit. Scripts stay editable anytime.
          </p>
        </div>
      )}

      <button
        onClick={() => setDrawer(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/15 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
      >
        VIEW FULL SALES KIT
      </button>
      <StrategyDrawer open={drawer} onOpenChange={setDrawer} title="MISSION 05 · FULL SALES KIT">
        <SalesModule content={content} />
      </StrategyDrawer>
    </div>
  );
}