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

// Retro-RPG world map over the launch journey. Completed nodes glow with the
// HustleDrop gradient, the current node pulses, future nodes stay dark. The
// user's HustleDNA sprite occupies the current node.
export default function QuestMap({ stats, avatar, onOpenMission, onOpenGrow }) {
  const questDone = stats.activeIndex < 0;
  const nodes = stats.missionStates.map((m, i) => ({
    key: m.type,
    label: m.node,
    icon: NODE_ICONS[m.type],
    state: m.completed ? 'done' : i === stats.activeIndex ? 'current' : 'locked',
    statusText: m.completed
      ? 'COMPLETE'
      : i === stats.activeIndex
        ? `${m.current_count} / ${m.target}`
        : 'LOCKED',
    onClick: () => onOpenMission(m.type),
  }));
  const allNodes = [
    { key: 'start', label: 'START', icon: Play, state: 'done', statusText: 'COMPLETE', onClick: null },
    ...nodes,
    { key: 'grow', label: 'GROW MODE', icon: Sprout, state: questDone ? 'current' : 'locked', statusText: questDone ? 'UNLOCKED' : 'AFTER FIRST CUSTOMER', onClick: questDone ? onOpenGrow : null },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="text-center text-xs font-semibold tracking-[0.25em] text-muted-foreground">QUEST MAP</div>
      <div className="mt-5 flex flex-col items-center">
        {allNodes.map((n, i) => {
          const Icon = n.icon;
          const clickable = !!n.onClick;
          return (
            <React.Fragment key={n.key}>
              {i > 0 && (
                <div
                  className={`h-6 w-0.5 rounded ${
                    n.state === 'locked'
                      ? 'bg-white/10'
                      : 'bg-gradient-to-b from-primary via-accent to-orange-400 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
                  }`}
                />
              )}
              {n.state === 'current' && n.key !== 'grow' && (
                <div className="my-1.5 animate-[bounce_2s_ease-in-out_infinite]">
                  <SpriteDisplay avatar={avatar} size="sm" />
                </div>
              )}
              <button
                onClick={clickable ? n.onClick : undefined}
                disabled={!clickable}
                className={`flex w-full max-w-sm items-center gap-3 rounded-xl border p-3 text-left transition ${
                  n.state === 'done'
                    ? 'border-gradient glow-primary'
                    : n.state === 'current'
                      ? 'border-primary/50 bg-brand-gradient-soft shadow-[0_0_24px_rgba(168,85,247,0.3)] hover:scale-[1.01]'
                      : 'border-white/10 bg-white/[0.02] opacity-50'
                } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 ${
                    n.state === 'done'
                      ? 'border-white/30 bg-white/10 text-foreground'
                      : n.state === 'current'
                        ? 'border-primary/50 bg-primary/15 text-primary'
                        : 'border-white/10 bg-white/[0.02] text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs font-bold tracking-wider text-foreground">{n.label}</div>
                  <div className="text-[10px] text-muted-foreground">{n.statusText}</div>
                </div>
                {n.state === 'done' && <Check className="h-4 w-4 shrink-0 text-primary" />}
                {n.state === 'locked' && <Lock className="h-3.5 w-3.5 shrink-0" />}
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
        Tap the glowing node to open its mission. Every mission is a real-world action — the game is the launch.
      </p>
    </div>
  );
}