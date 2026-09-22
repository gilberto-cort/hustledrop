import React from 'react';
import { Copy, Check, ArrowLeft } from 'lucide-react';
import { Chip } from '@/components/builder/builderKit';

function LoadoutItem({ item }) {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      // clipboard unavailable — user can still read the asset
    }
  };
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">{item.label}</span>
        <Chip tone="primary">EQUIPPED</Chip>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{item.value}</p>
      <button
        onClick={copy}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/40"
      >
        {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}

// LAUNCH LOADOUT — everything accepted in BUILD, one tap away. Launch Mode
// reads these assets; it never modifies them.
export default function LoadoutPanel({ items, launchPlan, onBack }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">LAUNCH LOADOUT</div>
          <p className="mt-1 text-[11px] text-muted-foreground">Everything you accepted in BUILD — read-only here.</p>
        </div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold tracking-wider text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          BACK TO MAP
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Nothing accepted yet — your Build modules will appear here.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <LoadoutItem key={item.key} item={item} />
          ))}
        </div>
      )}

      {launchPlan && Array.isArray(launchPlan.sprint_days) && launchPlan.sprint_days.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">
            LAUNCH PLAN — SOURCE MATERIAL
          </div>
          <ul className="mt-2 space-y-1.5">
            {launchPlan.sprint_days
              .slice()
              .sort((a, b) => (a.day || 0) - (b.day || 0))
              .map((d, i) => (
                <li key={i} className="text-xs leading-relaxed text-foreground/80">
                  <span className="font-mono font-bold text-muted-foreground">DAY {d.day}:</span> {d.primary_action}
                </li>
              ))}
          </ul>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Your generated validation plan — use it as reference material for the missions.
          </p>
        </div>
      )}
    </div>
  );
}