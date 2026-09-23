import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Briefcase, Rocket, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { loadBuilderState, BUILD_MODULES, acceptedByModule } from '@/lib/builderService';
import {
  loadLaunchData, startLaunchQuest, computeLaunchStats, completeLoadout,
  addProspect, advanceProspect, oneTapAction, quickAddContact, undoLastAction,
  updateProspectDetails, buildLoadoutItems,
} from '@/lib/launchService';
import { loadDailyQuestState, completePrepDaily } from '@/lib/dailyQuestService';
import DailyQuestCard from '@/components/daily/DailyQuestCard';
import DailyVictoryOverlay from '@/components/daily/DailyVictoryOverlay';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import LaunchHUD from '@/components/launch/LaunchHUD';
import QuestMap from '@/components/launch/QuestMap';
import LoadoutPanel from '@/components/launch/LoadoutPanel';
import ActiveMission from '@/components/launch/ActiveMission';
import MissionVictory from '@/components/launch/MissionVictory';
import LevelUpOverlay from '@/components/launch/LevelUpOverlay';
import { AnimatePresence, motion } from 'framer-motion';

// LAUNCH MODE 2.0 — the game IS the real-world launch journey. One active
// quest is always front and center with a single one-tap action; the quest
// map stays as the overview. All progress persists (LaunchQuest, missions,
// prospects, achievements, wins) and is re-derived from records — no
// fabricated sales, no double awards, purchases and Build data untouched.
export default function Launch() {
  const [phase, setPhase] = useState('loading'); // loading | no-selection | not-built | entry | ready | error
  const [reloadKey, setReloadKey] = useState(0);
  const [build, setBuild] = useState(null);
  const [game, setGame] = useState(null);
  const [view, setView] = useState('map'); // map | loadout
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [xpPop, setXpPop] = useState(null);
  const [victory, setVictory] = useState(null); // { mission, next }
  const [lastAction, setLastAction] = useState(null);
  const [daily, setDaily] = useState(null);
  const [dailyError, setDailyError] = useState(false);
  const [dailyVictory, setDailyVictory] = useState(null);
  const dailyPrev = useRef(null);
  const missionRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    (async () => {
      try {
        const s = await loadBuilderState();
        if (!s.selection) {
          if (!cancelled) setPhase('no-selection');
          return;
        }
        const accepted = acceptedByModule(s.assets);
        const built = BUILD_MODULES.every((m) => accepted[m.key]);
        let me = null;
        let avatar = null;
        try {
          me = await base44.auth.me();
          if (me?.selected_avatar_id) avatar = await base44.entities.Avatar.get(me.selected_avatar_id);
        } catch (e) {
          // avatar is cosmetic — a missing one shows the labelled placeholder
        }
        const buildState = {
          selection: s.selection,
          model: s.model,
          fit: s.fit,
          dna: s.dna,
          avatar,
          accepted,
          built,
          userId: me?.id,
        };
        if (cancelled) return;
        setBuild(buildState);
        if (!built) {
          setPhase('not-built');
          return;
        }
        const data = await loadLaunchData();
        if (cancelled) return;
        if (!data.quest) {
          setPhase('entry');
          return;
        }
        setGame(data);
        setPhase('ready');
        refreshDaily(data.quest, data.prospects);
      } catch (e) {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const stats = useMemo(() => (game ? computeLaunchStats(game.prospects, game.missions) : null), [game]);

  // DAILY QUEST — assignment and completion persist as DailyQuest records, so
  // the same quest shows on the dashboard, Launch and Grow. A completion
  // transition fires the small victory animation.
  const refreshDaily = async (questData, prospects) => {
    try {
      const ds = await loadDailyQuestState(questData, prospects);
      const prev = dailyPrev.current;
      if (prev && !prev.completed && ds.completed) {
        trackEvent('daily_quest_completed');
        setDailyVictory(ds.bossDefeated ? { kind: 'boss', streak: ds.streak } : { kind: 'daily', streak: ds.streak });
      } else if (prev && !prev.bossDefeated && ds.bossDefeated) {
        trackEvent('weekly_boss_defeated');
        setDailyVictory({ kind: 'boss', streak: ds.streak });
      }
      dailyPrev.current = ds;
      setDaily(ds);
      setDailyError(false);
    } catch (e) {
      setDailyError(true);
    }
  };

  const run = async (fn) => {
    if (busy) return false;
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      setGame(next);
      await refreshDaily(next.quest, next.prospects);
      return true;
    } catch (e) {
      setError('Something went wrong — your progress is safe. Try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  // Shared post-action bookkeeping: mission-completion detection, XP pop,
  // victory card, first-customer celebration and the undoable last action.
  // Everything is re-derived from the saved records, so a failed call or a
  // duplicate tap can never double-award.
  const applyOutcome = (before, next, action) => {
    const after = computeLaunchStats(next.prospects, next.missions);
    const firstCustomer = before.customerCount === 0 && after.customerCount > 0;
    const newDone = after.missionStates.filter((m, i) => !before.missionStates[i].completed && m.completed);
    newDone.forEach((m) => trackEvent('launch_mission_completed', { mission_type: m.type }));
    if (firstCustomer) {
      trackEvent('first_customer_won');
      trackEvent('grow_unlocked');
      setCelebrate(true); // the big Level-Up overlay IS the celebration here
    } else if (newDone.length > 0) {
      const done = newDone[0];
      setVictory({ mission: done, next: after.missionStates[done.index + 1] || null });
      const withXp = newDone.find((m) => m.xp > 0);
      if (withXp) {
        setXpPop({ id: Date.now(), amount: withXp.xp });
        setTimeout(() => setXpPop(null), 2200);
      }
    }
    setLastAction(action || null);
  };

  const handleEnter = async () => {
    const ok = await run(async () => {
      const data = await startLaunchQuest({
        userId: build.userId,
        selectedBusinessId: build.selection.id,
      });
      trackEvent('launch_entered');
      return data;
    });
    if (ok) setPhase('ready');
  };

  // ONE-TAP PROGRESS — the big button on the active quest.
  const handleOneTap = (prospect) =>
    run(async () => {
      const def = stats.missionStates[stats.activeIndex];
      const next = await oneTapAction(game.quest, def.type, prospect);
      trackEvent(prospect ? 'launch_action_recorded' : 'launch_action_quick_added', { mission_type: def.type });
      const created = next.lastAdded || null;
      applyOutcome(
        stats,
        next,
        created
          ? { type: 'add', prospectId: created.id, createdStatus: created.status }
          : {
              type: 'advance',
              prospectId: prospect.id,
              prevStatus: prospect.status,
              wasCustomer: def.type === 'first_customer',
              wasDeclined: false,
            }
      );
      return next;
    });

  const handleQuickAdd = (name, status) =>
    run(async () => {
      const next = await quickAddContact(game.quest, name, status);
      trackEvent('prospect_added');
      const created = next.lastAdded;
      applyOutcome(stats, next, { type: 'add', prospectId: created.id, createdStatus: created.status });
      return next;
    });

  // Roster actions (add / ladder / declined) share the same outcome handling.
  const handleAddProspect = (data) =>
    run(async () => {
      const next = await addProspect(game.quest, data);
      trackEvent('prospect_added');
      const created = next.lastAdded || null;
      applyOutcome(
        stats,
        next,
        created ? { type: 'add', prospectId: created.id, createdStatus: 'prospect' } : null
      );
      return next;
    });

  const handleAdvance = (prospect, nextStatus, extra = {}) =>
    run(async () => {
      const next = await advanceProspect(game.quest, prospect, nextStatus, extra);
      applyOutcome(stats, next, {
        type: 'advance',
        prospectId: prospect.id,
        prevStatus: prospect.status,
        wasCustomer: nextStatus === 'customer',
        wasDeclined: nextStatus === 'declined',
      });
      return next;
    });

  // CORRECTION — reverses the most recent action; XP, quest status and
  // unlocks are re-derived from records so nothing is left double-awarded.
  const handleUndo = () =>
    run(async () => {
      const next = await undoLastAction(game.quest, lastAction);
      trackEvent('launch_action_undone');
      setLastAction(null);
      setVictory(null);
      return next;
    });

  const handleUpdateDetails = (prospect, details) =>
    run(() => updateProspectDetails(game.quest, prospect, details));

  // Daily quest action — always the EXISTING underlying record system:
  // quick-add a real contact, advance a real prospect, or self-attest a prep
  // mission. XP settles inside those services; undo reverses it.
  const handleDailyAction = (a) => {
    if (a.selfAttest)
      return run(async () => {
        await completePrepDaily(game.quest);
        return game; // prep records no pipeline change
      });
    if (a.create) return handleQuickAdd('New contact', 'prospect');
    return handleAdvance(a.prospect, a.nextStatus);
  };

  const handleOpenLoadout = () => {
    setView('loadout');
    if (stats && stats.missionStates[0] && !stats.missionStates[0].completed && game) {
      run(async () => {
        const next = await completeLoadout(game.quest);
        trackEvent('launch_mission_completed', { mission_type: 'loadout' });
        applyOutcome(stats, next, null);
        return next;
      });
    }
  };

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (phase === 'no-selection') {
    return (
      <EmptyState
        icon={Briefcase}
        title="Choose a business first"
        description="Launch Mode turns your selected business into a real-world quest. Pick a business from your results to start."
        action={
          <Link to="/results" className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">
            VIEW MY MATCHES
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  if (phase === 'not-built') {
    return (
      <EmptyState
        icon={Rocket}
        title="LAUNCH MODE LOCKED"
        description="Finish your Business Builder first — Launch Mode uses your accepted customer, offer, price, brand and scripts as gear."
        action={
          <Link to="/build" className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">
            FINISH BUILDING
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  if (phase === 'error') {
    return (
      <EmptyState
        icon={RotateCcw}
        title="Launch Mode unavailable right now"
        description="We couldn't load your quest. Nothing was lost — try again."
        action={
          <button onClick={() => setReloadKey((k) => k + 1)} className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        }
      />
    );
  }

  if (phase === 'entry') {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <SpriteDisplay avatar={build.avatar} size="lg" />
        </div>
        <div>
          <div className="inline-block rounded-full border border-primary/40 bg-brand-gradient-soft px-4 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] text-primary">
            NEW AREA UNLOCKED
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gradient">LAUNCH MODE</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            "Your business exists on paper. Now let's find out what happens in the real world."
          </p>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-white/[0.02] p-5">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground">MAIN OBJECTIVE</div>
          <div className="mt-1.5 font-mono text-base font-bold tracking-wider text-foreground">
            GET YOUR FIRST CUSTOMER
          </div>
        </div>
        <button
          onClick={handleEnter}
          disabled={busy}
          className="w-full rounded-full bg-brand-gradient py-3.5 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
        >
          {busy ? 'ENTERING…' : 'ENTER LAUNCH MODE'}
        </button>
      </div>
    );
  }

  // phase === 'ready'
  const businessName = (build.accepted.brand && build.accepted.brand.chosen_name) || build.model.name;
  const loadoutItems = buildLoadoutItems(build.accepted);
  const activeDef = stats.activeIndex >= 0 ? stats.missionStates[stats.activeIndex] : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      {view === 'loadout' ? (
        <LoadoutPanel
          items={loadoutItems}
          launchPlan={build.accepted.launch || null}
          onBack={() => setView('map')}
        />
      ) : (
        <>
          <LaunchHUD
            businessName={businessName}
            dna={build.dna}
            quest={game.quest}
            stats={stats}
            achievements={game.achievements}
          />

          <DailyQuestCard
            daily={daily}
            loading={daily === null}
            error={dailyError}
            prospects={game.prospects}
            accepted={build.accepted}
            busy={busy}
            onAction={handleDailyAction}
            onRetry={() => refreshDaily(game.quest, game.prospects)}
          />

          {Array.isArray(build.model.compliance_flags) && build.model.compliance_flags.length > 0 && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-[11px] leading-relaxed text-foreground/80">
              <span className="font-bold text-yellow-400">BEFORE OPERATING —</span> verify what applies where you
              operate: {build.model.compliance_flags.map((f) => f.replace(/_review$/, '').replace(/_/g, ' ')).join(', ')}.
              Requirements vary by location — when uncertain, check with your local authority.
            </div>
          )}

          {activeDef ? (
            <div ref={missionRef}>
              <ActiveMission
                def={activeDef}
                prospects={game.prospects}
                accepted={build.accepted}
                dna={build.dna}
                busy={busy}
                lastAction={lastAction}
                onOneTap={handleOneTap}
                onQuickAdd={handleQuickAdd}
                onUndo={handleUndo}
                onUpdateDetails={handleUpdateDetails}
                onOpenLoadout={handleOpenLoadout}
                onRosterAdd={handleAddProspect}
                onRosterAdvance={handleAdvance}
                onAskUsed={() => trackEvent('ask_hustledrop_used')}
              />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-primary/40 bg-brand-gradient-soft p-6 text-center">
              <Trophy className="mx-auto h-6 w-6 text-primary" />
              <div className="mt-2 font-mono text-[10px] font-bold tracking-[0.3em] text-primary">MAIN QUEST COMPLETE</div>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-foreground">
                You recorded your first paying customer.
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Every quest in this world is done — your next chapter is keeping them coming back.
              </p>
              <Link
                to="/grow"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                ENTER GROW MODE
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleOpenLoadout}
              className="flex-1 rounded-full border border-white/15 py-2.5 text-xs font-bold tracking-wider text-foreground transition hover:border-primary/40"
            >
              VIEW LOADOUT
            </button>
          </div>

          <QuestMap
            stats={stats}
            avatar={build.avatar}
            onOpenMission={(type) => {
              if (type === 'loadout') {
                handleOpenLoadout();
              } else if (missionRef.current) {
                missionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            onOpenGrow={() => {
              /* the active-quest / complete cards handle Grow navigation */
            }}
          />

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-foreground/90">
              {error}
            </p>
          )}
        </>
      )}

      {victory && (
        <MissionVictory mission={victory.mission} next={victory.next} onClose={() => setVictory(null)} />
      )}

      <AnimatePresence>
        {xpPop && (
          <motion.div
            key={xpPop.id}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: -16, scale: 1 }}
            exit={{ opacity: 0, y: -36 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center"
          >
            <span className="rounded-full border border-primary/40 bg-card/95 px-5 py-2 font-mono text-sm font-bold tracking-wider text-primary shadow-[0_0_30px_rgba(168,85,247,0.45)]">
              +{xpPop.amount} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {celebrate && <LevelUpOverlay onClose={() => setCelebrate(false)} />}

      <DailyVictoryOverlay victory={dailyVictory} avatar={build.avatar} onClose={() => setDailyVictory(null)} />
    </div>
  );
}