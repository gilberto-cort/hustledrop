import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Briefcase, Rocket, ArrowRight, RotateCcw, Check } from 'lucide-react';
import { loadBuilderState, BUILD_MODULES, acceptedByModule } from '@/lib/builderService';
import {
  loadLaunchData, startLaunchQuest, computeLaunchStats, completeLoadout,
  addProspect, advanceProspect, buildLoadoutItems,
} from '@/lib/launchService';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import LaunchHUD from '@/components/launch/LaunchHUD';
import QuestMap from '@/components/launch/QuestMap';
import MissionDialog from '@/components/launch/MissionDialog';
import LoadoutPanel from '@/components/launch/LoadoutPanel';
import LevelUpOverlay from '@/components/launch/LevelUpOverlay';
import { AnimatePresence, motion } from 'framer-motion';

// LAUNCH MODE — a lightweight retro-RPG business adventure. Every mechanic
// maps to a real-world action; all progress persists (LaunchQuest, missions,
// prospects, achievements, wins).
export default function Launch() {
  const [phase, setPhase] = useState('loading'); // loading | no-selection | not-built | entry | ready | error
  const [reloadKey, setReloadKey] = useState(0);
  const [build, setBuild] = useState(null);
  const [game, setGame] = useState(null);
  const [view, setView] = useState('map'); // map | loadout
  const [openMission, setOpenMission] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [xpPop, setXpPop] = useState(null);

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
      } catch (e) {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const stats = useMemo(() => (game ? computeLaunchStats(game.prospects, game.missions) : null), [game]);

  const run = async (fn) => {
    if (busy) return false;
    setBusy(true);
    setError(null);
    try {
      const next = await fn();
      setGame(next);
      return true;
    } catch (e) {
      setError('Something went wrong — your progress is safe. Try again.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleEnter = () =>
    run(async () => {
      const data = await startLaunchQuest({
        userId: build.userId,
        selectedBusinessId: build.selection.id,
      });
      trackEvent('launch_entered');
      return data;
    });

  const handleAddProspect = (data) =>
    run(async () => {
      const next = await addProspect(game.quest, data);
      trackEvent('prospect_added');
      return next;
    });

  const handleAdvance = (prospect, nextStatus, extra = {}) =>
    run(async () => {
      const before = stats;
      const next = await advanceProspect(game.quest, prospect, nextStatus, extra);
      const after = computeLaunchStats(next.prospects, next.missions);
      const newDone = after.missionStates.filter((m, i) => !before.missionStates[i].completed && m.completed);
      newDone.forEach((m) => trackEvent('launch_mission_completed', { mission_type: m.type }));
      const withXp = newDone.find((m) => m.xp > 0);
      if (withXp) {
        setXpPop({ id: Date.now(), amount: withXp.xp });
        setTimeout(() => setXpPop(null), 2200);
      }
      if (nextStatus === 'customer' && before.customerCount === 0 && after.customerCount > 0) {
        trackEvent('first_customer_won');
        setCelebrate(true);
      }
      return next;
    });

  const handleOpenLoadout = () => {
    setView('loadout');
    if (stats && stats.missionStates[0] && !stats.missionStates[0].completed && game) {
      run(() => completeLoadout(game.quest));
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
  const activeDef = openMission ? stats.missionStates.find((m) => m.type === openMission) : null;

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

          {Array.isArray(build.model.compliance_flags) && build.model.compliance_flags.length > 0 && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-[11px] leading-relaxed text-foreground/80">
              <span className="font-bold text-yellow-400">BEFORE OPERATING —</span> verify what applies where you
              operate: {build.model.compliance_flags.map((f) => f.replace(/_review$/, '').replace(/_/g, ' ')).join(', ')}.
              Requirements vary by location — when uncertain, check with your local authority.
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
            onOpenMission={(type) => (type === 'loadout' ? handleOpenLoadout() : setOpenMission(type))}
            onOpenGrow={() => {
              /* grow banner below handles navigation */
            }}
          />

          {stats.customerCount > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-brand-gradient-soft p-5 text-center">
              <div className="text-[10px] font-bold tracking-[0.25em] text-primary">NEW AREA UNLOCKED — GROW MODE</div>
              <Link
                to="/grow"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white"
              >
                ENTER GROW MODE
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-foreground/90">
              {error}
            </p>
          )}
        </>
      )}

      {activeDef && (
        <MissionDialog
          def={activeDef}
          prospects={game.prospects}
          accepted={build.accepted}
          dna={build.dna}
          busy={busy}
          onClose={() => setOpenMission(null)}
          onAddProspect={handleAddProspect}
          onAdvance={handleAdvance}
          onAskUsed={() => trackEvent('ask_hustledrop_used')}
        />
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
    </div>
  );
}