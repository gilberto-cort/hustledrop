import React from 'react';
import {
  Play, Backpack, Crosshair, Send, MessagesSquare, MailCheck, Flag, Crown, Sprout, Lock, Check,
} from 'lucide-react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';

const NODE_ICONS = {
  loadout: Backpack,
  prospect_hunt: Crosshair,
  first_contact: Send,
  conversations: MessagesSquare,
  follow_up: MailCheck,
  first_lead: Flag,
  first_customer: Crown,
};

// Retro-RPG world map over the launch journey. Completed milestones glow with
// the HustleDrop gradient badge, the ACTIVE quest carries the character sprite
// plus a live progress bar, and future quests stay visibly locked. The user's
// HustleDNA sprite marks their position on the journey.
export default function QuestMap({ stats, avatar, onOpenMission, onOpenGrow }) {
  const questDone = stats.activeIndex < 0;
  const nodes = stats.missionStates.map((m, i) => ({
    key: m.type,
    label: m.node,
    icon: NODE_ICONS[m.type],
    state: m.completed ? 'done' : i === stats.activeIndex ? 'current' : 'locked',
    progress: m.target > 1 ? Math.min(1, (m.current_count || 0) / m.target) : null,
    statusText: m.completed
      ? 'MILESTONE COMPLETE'
      : i === stats.activeIndex
        ? `${m.current_count} / ${m.target}`
        : 'LOCKED',
    onClick: () => onOpenMission(m.type),
  }));
  const allNodes = [
    { key: 'start', label: 'START', icon: Play, state: 'done', progress: null, statusText: 'MILESTONE COMPLETE', onClick: null },
    ...nodes,
    { key: 'grow', label: 'GROW MODE', icon: Sprout, state: questDone ? 'current' : 'locked', progress: null, statusText: questDone ? 'UNLOCKED' : 'AFTER FIRST CUSTOMER', onClick: questDone ? onOpenGrow : null },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="text-center text-xs font-semibold tracking-[0.25em] text-muted-foreground">QUEST MAP</div>
      <div className="mt-6 flex flex-col items-center">
        {allNodes.map((n, i) => {
          const Icon = n.icon;
          const clickable = !!n.onClick;
          return (
            <React.Fragment key={n.key}>
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className={`h-7 w-0.5 rounded ${
                    n.state === 'locked'
                      ? 'bg-white/10'
                      : 'bg-gradient-to-b from-primary via-accent to-orange-400 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                  }`}
                />
              )}
              {n.state === 'current' && n.key !== 'grow' && (
                <div className="relative my-2 animate-[bounce_2s_ease-in-out_infinite] motion-reduce:animate-none">
                  <SpriteDisplay avatar={avatar} size="sm" />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-primary/50 bg-background px-1.5 py-0.5 font-mono text-[7px] font-bold tracking-widest text-primary">
                    YOU
                  </span>
                </div>
              )}
              <button
                onClick={clickable ? n.onClick : undefined}
                disabled={!clickable}
                aria-current={n.state === 'current' ? 'step' : undefined}
                className={`flex w-full max-w-sm items-center gap-3 rounded-xl border p-3 text-left transition ${
                  n.state === 'done'
                    ? 'border-gradient glow-primary'
                    : n.state === 'current'
                      ? 'border-primary/60 bg-brand-gradient-soft shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:scale-[1.01]'
                      : 'border-white/10 bg-white/[0.02] opacity-50'
                } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 ${
                    n.state === 'done'
                      ? 'border-transparent bg-brand-gradient text-white'
                      : n.state === 'current'
                        ? 'border-primary/60 bg-primary/20 text-primary'
                        : 'border-white/10 bg-white/[0.02] text-muted-foreground'
                  }`}
                >
                  {n.state === 'done' ? <Check className="h-6 w-6" strokeWidth={3} /> : <Icon className="h-6 w-6" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-bold tracking-wider text-foreground">{n.label}</span>
                    {n.state === 'current' && n.key !== 'grow' && (
                      <span className="rounded-full border border-primary/50 bg-primary/15 px-1.5 py-0.5 font-mono text-[7px] font-bold tracking-widest text-primary">
                        ACTIVE QUEST
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground">{n.statusText}</div>
                  {n.state === 'current' && n.progress !== null && (
                    <div className="mt-2 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-brand-gradient transition-all duration-500 motion-reduce:transition-none"
                        style={{ width: `${Math.round(n.progress * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                {n.state === 'done' && <Check className="h-4 w-4 shrink-0 text-primary" />}
                {n.state === 'locked' && <Lock className="h-3.5 w-3.5 shrink-0" />}
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
        Your journey at a glance — the active quest lives in the card above. Every mission is a real-world action;
        the game is the launch.
      </p>
    </div>
  );
}