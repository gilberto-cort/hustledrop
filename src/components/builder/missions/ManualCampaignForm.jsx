import React, { useState } from 'react';
import { Megaphone, Zap, Tag, Users, MapPin, Globe } from 'lucide-react';

// MANUAL CAMPAIGN FORM — the user's own mission 06 when the AI kit is
// unavailable. Everything is user-written; nothing is fabricated, and the
// saved draft must be explicitly accepted before the mission completes.
const CHANNELS = [
  { key: 'social', label: 'SOCIAL', Icon: Megaphone },
  { key: 'shortform', label: 'SHORT-FORM', Icon: Zap },
  { key: 'promo', label: 'PROMOTION', Icon: Tag },
  { key: 'referral', label: 'REFERRALS', Icon: Users },
  { key: 'local', label: 'LOCAL', Icon: MapPin },
  { key: 'online', label: 'ONLINE', Icon: Globe },
];

export default function ManualCampaignForm({ busy, onSubmit }) {
  const [channels, setChannels] = useState(new Set(['social']));
  const [message, setMessage] = useState('');
  const [action, setAction] = useState('');
  const [goal, setGoal] = useState('');

  const valid = channels.size > 0 && message.trim() && action.trim() && goal.trim();

  const toggle = (key) => {
    const next = new Set(channels);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChannels(next);
  };

  return (
    <div className="mt-3 space-y-3 text-left">
      <div>
        <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">MY CHANNELS</div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {CHANNELS.map(({ key, label, Icon }) => {
            const on = channels.has(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={on}
                className={`flex items-center justify-center gap-1 rounded-lg border px-1.5 py-2 font-mono text-[9px] font-bold tracking-wider transition ${
                  on
                    ? 'border-primary/50 bg-brand-gradient-soft text-primary'
                    : 'border-white/10 bg-white/[0.02] text-muted-foreground'
                }`}
              >
                <Icon className="h-3 w-3 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="block">
        <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
          FIRST CAMPAIGN MESSAGE
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={400}
          placeholder="What you'll say to your accepted customer"
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
        />
      </label>

      <label className="block">
        <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
          FIRST OUTREACH ACTION
        </span>
        <input
          type="text"
          value={action}
          onChange={(e) => setAction(e.target.value)}
          maxLength={120}
          placeholder="e.g. Post in 2 local wedding groups"
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
        />
      </label>

      <label className="block">
        <span className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
          FIRST MEASURABLE GOAL
        </span>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          maxLength={120}
          placeholder="e.g. 5 replies by Sunday"
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
        />
      </label>

      <button
        type="button"
        onClick={() =>
          onSubmit({
            core_message: message.trim(),
            outreach_action: action.trim(),
            first_goal: goal.trim(),
            selected_channels: [...channels],
          })
        }
        disabled={!valid || busy}
        className="w-full rounded-full border border-primary/40 bg-primary/10 py-2.5 text-[10px] font-bold tracking-widest text-primary transition hover:bg-primary/20 disabled:opacity-40"
      >
        {busy ? 'SAVING…' : 'SAVE MY CAMPAIGN'}
      </button>
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Your campaign is saved as YOURS — you confirm it yourself on the next screen. No AI kit is generated.
      </p>
    </div>
  );
}