import React from 'react';
import { Crown } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import MilestoneBody from './MilestoneBody';
import ReviewMissionBody from './ReviewMissionBody';
import ReferralMissionBody from './ReferralMissionBody';
import RepeatWinMissionBody from './RepeatWinMissionBody';
import SystemMissionBody from './SystemMissionBody';

// A Grow mission screen — RPG quest panel over REAL growth actions.
export default function GrowMissionPanel({ def, mission, wins, equipped, busy, onClose, actions }) {
  if (!def) return null;
  const isFinal = def.type === 'customer_5';
  const isMilestone = !!def.milestone;

  const body = isMilestone ? (
    <MilestoneBody def={def} wins={wins} onRecordCustomer={actions.onRecordCustomer} />
  ) : def.type === 'review' ? (
    <ReviewMissionBody def={def} mission={mission} equipped={equipped} busy={busy} actions={actions} />
  ) : def.type === 'referral' ? (
    <ReferralMissionBody def={def} mission={mission} equipped={equipped} busy={busy} actions={actions} />
  ) : def.type === 'repeat_win' ? (
    <RepeatWinMissionBody def={def} mission={mission} wins={wins} equipped={equipped} busy={busy} actions={actions} />
  ) : (
    <SystemMissionBody def={def} mission={mission} busy={busy} actions={actions} />
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto border-white/10 bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-lg font-semibold">
            <span className="font-mono text-xs font-bold text-muted-foreground">
              {isFinal ? 'FINAL BOSS' : isMilestone ? 'MILESTONE' : `QUEST 0${def.index + 1}`}
            </span>
            {def.title}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            {def.xp > 0 && (
              <>
                <span className="font-mono">Reward: +{def.xp} XP</span>
                <span>·</span>
              </>
            )}
            <span>{isMilestone ? 'Measured from your real customer records' : 'One real action completes it'}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isFinal && !def.completed && (
            <div className="rounded-xl border border-primary/40 bg-brand-gradient-soft p-4 text-center">
              <Crown className="mx-auto h-5 w-5 text-primary" />
              <div className="mt-1 font-mono text-xs font-bold tracking-widest text-primary">
                THE ROAD TO 5 — FINAL STRETCH
              </div>
            </div>
          )}
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">OBJECTIVE</div>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{def.mission}</p>
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">WHY IT MATTERS</div>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">{def.why}</p>
          </div>
          {body}
          {def.completed && (
            <div className="rounded-xl border-2 border-primary/40 bg-brand-gradient-soft p-4 text-center">
              <div className="font-mono text-xs font-bold tracking-widest text-primary">QUEST COMPLETE</div>
              {def.xp > 0 && (
                <div className="mt-1 font-mono text-sm font-bold text-foreground">+{def.xp} XP</div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}