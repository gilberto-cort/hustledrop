import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Lightbulb, Wrench, Users, HelpCircle, Undo2 } from 'lucide-react';
import { MISSION_ONE_TAP, eligibleProspects } from '@/lib/launchService';
import ContactPicker from './ContactPicker';
import MissionGuidance from './MissionGuidance';
import MissionGear from './MissionGear';
import ProspectDetailsForm from './ProspectDetailsForm';
import ProspectRoster from './ProspectRoster';
import AskHustleDrop from '@/components/builder/AskHustleDrop';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const SECTIONS = [
  { key: 'how', label: 'HOW DO I DO THIS?', Icon: Lightbulb },
  { key: 'gear', label: 'MY GEAR', Icon: Wrench },
  { key: 'contacts', label: 'MY CONTACTS', Icon: Users },
  { key: 'ask', label: 'ASK HUSTLEDROP', Icon: HelpCircle },
];

const MISSION_EXAMPLES = [
  'Who should I reach out to first?',
  'What do I say after they reply?',
  'How do I handle silence after outreach?',
];

const MISSION_DESC =
  'Advice for this mission — HustleDrop knows your business, equipped assets and HustleDNA. Advice only: it never changes your content.';

// THE ACTIVE QUEST — one prominent mission card with ONE big first-person
// action button. Saves immediately (+1 feedback), supports WRONG TAP? UNDO
// and optional ADD DETAILS. Guidance, gear and the contact roster stay
// collapsed so only the next action is visible.
export default function ActiveMission({
  def, prospects, accepted, dna, busy, lastAction,
  onOneTap, onQuickAdd, onUndo, onUpdateDetails, onOpenLoadout, onRosterAdd, onRosterAdvance, onAskUsed,
}) {
  const cfg = MISSION_ONE_TAP[def.type] || {};
  const eligible = eligibleProspects(def.type, prospects);
  const [selectedId, setSelectedId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [section, setSection] = useState(null);
  const [showPlus, setShowPlus] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const reduce = useReducedMotion();

  // Keep a valid, unambiguous selection: auto-pick the first eligible
  // contact; null means the quick unnamed record.
  useEffect(() => {
    if (!cfg.from) return undefined;
    if (!eligible.some((c) => c.id === selectedId)) {
      setSelectedId(eligible[0] ? eligible[0].id : null);
    }
    return undefined;
  }, [eligible, selectedId, cfg.from]);

  // +1 fires only after the save succeeds (lastAction is set on success).
  useEffect(() => {
    if (!lastAction) return undefined;
    setShowPlus(true);
    const t = setTimeout(() => setShowPlus(false), 1600);
    return () => clearTimeout(t);
  }, [lastAction]);

  const selected = eligible.find((c) => c.id === selectedId) || null;
  const lastProspect = lastAction ? (prospects || []).find((p) => p.id === lastAction.prospectId) : null;
  const pct = Math.min(100, Math.round((def.current_count / def.target) * 100));

  const handlePrimary = () => {
    if (busy) return;
    if (def.type === 'loadout') {
      onOpenLoadout();
      return;
    }
    if (cfg.confirm) {
      setConfirming(true); // first customer always confirms explicitly
      return;
    }
    onOneTap(selected);
  };

  const handleDetailsSave = async (details) => {
    const ok = await onUpdateDetails(lastProspect, details);
    if (ok !== false) setDetailsOpen(false);
  };

  return (
    <div className="rounded-2xl border-gradient glow-primary p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] font-bold tracking-[0.25em] text-primary">
            {def.index === 0 ? 'FIRST QUEST' : `ACTIVE QUEST 0${def.index + 1}`}
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">{def.title}</h2>
        </div>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[9px] font-bold tracking-wider text-primary">
          {def.xp > 0 ? `+${def.xp} XP` : 'GEAR READY'}
        </span>
      </div>

      <p className="mt-2.5 text-sm leading-relaxed text-foreground/90">{def.mission}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[10px] font-bold tracking-wider text-muted-foreground">
          <span>PROGRESS</span>
          <span>
            {def.current_count} / {def.target}
          </span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500 motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {cfg.from && (
        <div className="mt-4">
          {eligible.length > 0 ? (
            <ContactPicker contacts={eligible} selectedId={selectedId} onSelect={setSelectedId} allowNew={!cfg.confirm} />
          ) : cfg.confirm ? (
            <div className="rounded-xl border border-dashed border-white/20 p-3.5">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Who did you sell to? Add them first — a real name is all we need.
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  maxLength={120}
                  placeholder="Customer name or alias"
                  aria-label="Customer name or alias"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
                />
                <button
                  onClick={() => {
                    if (newName.trim()) {
                      onQuickAdd(newName.trim(), 'lead');
                      setNewName('');
                    }
                  }}
                  disabled={busy || !newName.trim()}
                  className="shrink-0 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-[10px] font-bold tracking-wider text-primary transition hover:bg-primary/20 disabled:opacity-40"
                >
                  ADD
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              No contact picked yet — tap the button anyway and it gets recorded, or add someone under MY CONTACTS
              below.
            </p>
          )}
        </div>
      )}

      <div className="relative mt-4">
        <button
          onClick={handlePrimary}
          disabled={busy || (cfg.confirm && !selected)}
          className="w-full rounded-full bg-brand-gradient py-4 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40 motion-reduce:transition-none"
        >
          {busy ? 'SAVING…' : cfg.cta || 'DO IT'}
        </button>
        <AnimatePresence>
          {showPlus && lastAction && (
            <motion.span
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: 1, y: -14, scale: 1 }}
              exit={{ opacity: 0, y: -26 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute -top-2 right-4 rounded-full border border-primary/50 bg-card px-2.5 py-1 font-mono text-[10px] font-bold text-primary shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              +1 SAVED
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {lastAction && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-muted-foreground">
              {lastAction.type === 'add'
                ? 'Saved — a new contact joined your list.'
                : 'Saved — your action is recorded.'}
            </span>
            <div className="flex items-center gap-3">
              {lastAction.type === 'add' && lastProspect && (
                <button
                  onClick={() => setDetailsOpen((d) => !d)}
                  className="text-[10px] font-bold tracking-wider text-primary transition hover:underline"
                >
                  {detailsOpen ? 'HIDE DETAILS' : 'ADD DETAILS'}
                </button>
              )}
              <button
                onClick={onUndo}
                disabled={busy}
                className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                <Undo2 className="h-3 w-3" />
                WRONG TAP? UNDO
              </button>
            </div>
          </div>
          {detailsOpen && lastProspect && (
            <ProspectDetailsForm prospect={lastProspect} busy={busy} onSave={handleDetailsSave} />
          )}
        </div>
      )}

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
        {SECTIONS.map(({ key, label, Icon }) => {
          const open = section === key;
          return (
            <div key={key} className="rounded-xl border border-white/10 bg-white/[0.02]">
              <button
                onClick={() => setSection(open ? null : key)}
                aria-expanded={open}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
              >
                <span className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {key === 'contacts' && prospects.length > 0 ? ` (${prospects.length})` : ''}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform motion-reduce:transition-none ${
                    open ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {open && (
                <div className="border-t border-white/10 p-3.5">
                  {key === 'how' && <MissionGuidance def={def} accepted={accepted} dna={dna} />}
                  {key === 'gear' && <MissionGear accepted={accepted} missionType={def.type} />}
                  {key === 'contacts' && (
                    <ProspectRoster prospects={prospects} busy={busy} onAdd={onRosterAdd} onAdvance={onRosterAdvance} />
                  )}
                  {key === 'ask' && (
                    <AskHustleDrop
                      onUsed={onAskUsed}
                      examples={MISSION_EXAMPLES}
                      description={MISSION_DESC}
                      placeholder="Ask about this mission…"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={confirming} onOpenChange={(o) => !o && setConfirming(false)}>
        <DialogContent className="max-w-md border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">I LANDED MY FIRST CUSTOMER</DialogTitle>
            <DialogDescription className="text-[11px] leading-relaxed">
              Only confirm a REAL sale — {selected ? selected.name_or_alias : 'this contact'} actually paid or committed
              to pay for your offer.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs leading-relaxed text-foreground/80">
            This completes the Launch quest, unlocks GROW mode and records your first customer win. If you tapped by
            mistake, WRONG TAP? UNDO appears right after.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirming(false)} className="rounded-full border-white/15">
              CANCEL
            </Button>
            <Button
              onClick={() => {
                setConfirming(false);
                onOneTap(selected);
              }}
              disabled={busy || !selected}
              className="rounded-full bg-brand-gradient font-bold tracking-wider text-white hover:opacity-90"
            >
              {busy ? 'SAVING…' : "IT'S REAL — RECORD IT"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}