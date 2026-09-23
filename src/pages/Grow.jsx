import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';
import { AnimatePresence, motion } from 'framer-motion';
import { loadBuilderState, acceptedByModule } from '@/lib/builderService';
import {
  loadLaunchData, computeLaunchStats, buildLoadoutItems, addProspect, advanceProspect, quickAddContact,
} from '@/lib/launchService';
import { loadDailyQuestState, completePrepDaily } from '@/lib/dailyQuestService';
import {
  initGrow, loadGrowData, computeGrowStats, generateGrowContent,
  markReviewSent, logReviewFeedback, markReferralReady, saveRepeatSource, completeRepeatWin,
  equipSystem, saveSystemSteps, completeSideQuest, logGrowCustomer,
  GROW_XP_GOAL, GROW_EQUIPPED,
} from '@/lib/growService';
import AskHustleDrop from '@/components/builder/AskHustleDrop';
import GrowHeader from '@/components/grow/GrowHeader';
import GrowWorldMap from '@/components/grow/GrowWorldMap';
import GrowMissionPanel from '@/components/grow/GrowMissionPanel';
import GrowPipeline from '@/components/grow/GrowPipeline';
import CustomerForm from '@/components/grow/CustomerForm';
import DailyQuestCard from '@/components/daily/DailyQuestCard';
import DailyVictoryOverlay from '@/components/daily/DailyVictoryOverlay';
import SideQuests from '@/components/grow/SideQuests';
import MilestoneOverlay from '@/components/grow/MilestoneOverlay';
import ProspectForm from '@/components/launch/ProspectForm';

const GROW_EXAMPLES = [
  'What should I do today?',
  "Why aren't people responding?",
  'How do I get another customer?',
  'What worked with my first customer?',
];

// GROW MODE v1 — "THE ROAD TO 5". The next world after Launch, played over
// the SAME persistent records: LaunchQuest, Prospect pipeline, CustomerWin.
export default function Grow() {
  const [phase, setPhase] = useState('loading'); // loading | locked | error | ready
  const [reloadKey, setReloadKey] = useState(0);
  const [build, setBuild] = useState(null);
  const [launch, setLaunch] = useState(null);
  const [grow, setGrow] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [openMission, setOpenMission] = useState(null);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [prospectFormOpen, setProspectFormOpen] = useState(false);
  const [milestone, setMilestone] = useState(null);
  const [xpPop, setXpPop] = useState(null);
  const [daily, setDaily] = useState(null);
  const [dailyError, setDailyError] = useState(false);
  const [victory, setVictory] = useState(null);
  const dailyPrev = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const launchData = await loadLaunchData();
        if (!launchData.quest) {
          if (!cancelled) setPhase('locked');
          return;
        }
        const wins = await base44.entities.CustomerWin.filter(
          { launch_quest_id: launchData.quest.id },
          '-created_date',
          100
        );
        if (!wins || wins.length === 0) {
          if (!cancelled) setPhase('locked');
          return;
        }

        // Unlocked — first real customer recorded.
        const g = await initGrow(launchData.quest);
        const s = await loadBuilderState();
        let avatar = null;
        try {
          const me = await base44.auth.me();
          if (me?.selected_avatar_id) avatar = await base44.entities.Avatar.get(me.selected_avatar_id);
        } catch (e) {
          // avatar is cosmetic
        }
        if (cancelled) return;

        setBuild({ accepted: acceptedByModule(s.assets), model: s.model, dna: s.dna, avatar });
        setLaunch(launchData);
        setGrow(g);
        setPhase('ready');
        refreshDaily(launchData.quest, launchData.prospects);

        // Show a reached-but-unseen milestone celebration once.
        const stats = computeGrowStats(g.missions, g.wins, g.growState);
        const flag = (t) => `hd_milestone_${launchData.quest.id}_${t}`;
        if (stats.customers >= 5 && !localStorage.getItem(flag('customer_5'))) {
          setMilestone('customer_5');
        } else if (stats.customers >= 3 && !localStorage.getItem(flag('customer_3'))) {
          setMilestone('customer_3');
        }
      } catch (e) {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const launchStats = useMemo(
    () => (launch ? computeLaunchStats(launch.prospects, launch.missions) : null),
    [launch]
  );
  const growStats = useMemo(
    () => (grow ? computeGrowStats(grow.missions, grow.wins, grow.growState) : null),
    [grow]
  );
  const totalXp = (launchStats?.xp || 0) + (growStats?.xp || 0);
  // DAILY QUEST — assignment and completion persist as DailyQuest records, so
  // the same quest shows on the dashboard, Launch and Grow. A completion
  // transition fires the small victory animation.
  const refreshDaily = async (questData, prospects) => {
    try {
      const ds = await loadDailyQuestState(questData, prospects);
      const prev = dailyPrev.current;
      if (prev && !prev.completed && ds.completed) {
        trackEvent('daily_quest_completed');
        setVictory(ds.bossDefeated ? { kind: 'boss', streak: ds.streak } : { kind: 'daily', streak: ds.streak });
      } else if (prev && !prev.bossDefeated && ds.bossDefeated) {
        trackEvent('weekly_boss_defeated');
        setVictory({ kind: 'boss', streak: ds.streak });
      }
      dailyPrev.current = ds;
      setDaily(ds);
      setDailyError(false);
    } catch (e) {
      setDailyError(true);
    }
  };

  const runAction = async (serviceCalls) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const before = growStats;
    try {
      await serviceCalls();
      const [ld, g] = await Promise.all([loadLaunchData(), loadGrowData(launch.quest)]);
      setLaunch(ld);
      setGrow(g);
      await refreshDaily(ld.quest, ld.prospects);
      const after = computeGrowStats(g.missions, g.wins, g.growState);
      if (before && after.xp > before.xp) {
        setXpPop({ id: Date.now(), amount: after.xp - before.xp });
        setTimeout(() => setXpPop(null), 2200);
      }
      if (before) {
        after.missionStates.forEach((m, i) => {
          if (!before.missionStates[i].completed && m.completed) {
            trackEvent('grow_mission_completed', { mission_type: m.type });
          }
        });
        if (before.customers < 3 && after.customers >= 3) {
          trackEvent('customer_3_reached');
          setMilestone('customer_3');
        }
        if (before.customers < 5 && after.customers >= 5) {
          trackEvent('customer_5_reached');
          setMilestone('customer_5');
        }
      }
    } catch (e) {
      setError('Something went wrong — your progress is safe. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const missionRecord = (type) => grow?.missions?.find((m) => m.mission_type === type) || null;

  // Daily quest action — always the EXISTING underlying record system:
  // quick-add a real contact, advance a real prospect, or self-attest a prep
  // mission. XP settles inside those services; undo reverses it.
  const handleDailyAction = (a) => {
    if (a.selfAttest) return runAction(() => completePrepDaily(launch.quest));
    if (a.create) return runAction(() => quickAddContact(launch.quest, 'New contact', 'prospect'));
    return runAction(() => {
      if (a.nextStatus === 'customer') trackEvent('customer_logged');
      return advanceProspect(launch.quest, a.prospect, a.nextStatus);
    });
  };

  const closeMilestone = () => {
    if (milestone && launch) localStorage.setItem(`hd_milestone_${launch.quest.id}_${milestone}`, '1');
    setMilestone(null);
  };

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (phase === 'locked') {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white/15 bg-white/[0.02]">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">GROW MODE</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your next world unlocks after your first customer.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-brand-gradient-soft p-5">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground">MAIN QUEST</div>
          <div className="mt-1.5 font-mono text-base font-bold tracking-wider text-foreground">
            GET YOUR FIRST CUSTOMER
          </div>
        </div>
        <Link
          to="/launch"
          className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          RETURN TO LAUNCH
        </Link>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          The next game area is waiting — no rush, no penalty. It opens the moment you record a real customer.
        </p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <p className="text-sm text-muted-foreground">Grow Mode couldn't load right now. Nothing was lost.</p>
        <button
          onClick={() => {
            setPhase('loading');
            setReloadKey((k) => k + 1);
          }}
          className="rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  // phase === 'ready'
  const businessName = (build.accepted.brand && build.accepted.brand.chosen_name) || build.model.name;
  const loadoutItems = buildLoadoutItems(build.accepted);
  const equippedFor = (type) =>
    (GROW_EQUIPPED[type] || []).map((k) => loadoutItems.find((i) => i.key === k)).filter(Boolean);

  const openDef = openMission ? growStats.missionStates.find((m) => m.type === openMission) : null;
  const doneSides = grow?.growState?.completed_side_quests || [];
  const activeMilestoneDef = openDef?.milestone
    ? { onRecordCustomer: () => {
        setOpenMission(null);
        setCustomerFormOpen(true);
      } }
    : {};

  const actions = {
    onGenerate: (type, options) =>
      runAction(async () => {
        await generateGrowContent(type, options);
        trackEvent('grow_mission_started', { mission_type: type });
      }),
    onMarkSent: () => runAction(() => {
      trackEvent('review_request_logged');
      return markReviewSent(launch.quest, missionRecord('review'));
    }),
    onLogFeedback: (feedback) =>
      runAction(() => logReviewFeedback(launch.quest, missionRecord('review'), feedback)),
    onReferralReady: () =>
      runAction(() => {
        trackEvent('referral_system_created');
        return markReferralReady(launch.quest, missionRecord('referral'));
      }),
    onSaveSource: (source) =>
      runAction(() => {
        trackEvent('customer_source_recorded', { source });
        return saveRepeatSource(launch.quest, missionRecord('repeat_win'), source);
      }),
    onCompleteRepeatWin: () =>
      runAction(() => completeRepeatWin(launch.quest, missionRecord('repeat_win'))),
    onEquipSystem: () =>
      runAction(() => {
        trackEvent('grow_system_equipped');
        return equipSystem(launch.quest, missionRecord('system'));
      }),
    onSaveSystemSteps: (stepsText) =>
      runAction(() => saveSystemSteps(launch.quest, missionRecord('system'), stepsText)),
  };

  const milestoneSummary = grow
    ? {
        customers: grow.wins.length,
        sources: new Set(grow.wins.map((w) => w.acquisition_channel).filter(Boolean)).size,
        conversations: launchStats.conversationCount,
        leads: launchStats.leadCount,
        referrals: grow.wins.filter((w) => w.acquisition_channel === 'referral' || w.referral_source).length,
        repeats: grow.wins.filter((w) => w.repeat_customer).length,
      }
    : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <GrowHeader
        businessName={businessName}
        dna={build.dna}
        avatar={build.avatar}
        level={growStats.level}
        xp={totalXp}
        xpGoal={GROW_XP_GOAL}
        streak={launch.quest.streak}
        customers={growStats.customers}
        achievements={grow.achievements}
      />

      <DailyQuestCard
        daily={daily}
        loading={daily === null}
        error={dailyError}
        prospects={launch.prospects}
        accepted={build.accepted}
        busy={busy}
        onAction={handleDailyAction}
        onRetry={() => refreshDaily(launch.quest, launch.prospects)}
      />

      <GrowWorldMap stats={growStats} avatar={build.avatar} onOpenMission={setOpenMission} />

      <GrowPipeline
        prospects={launch.prospects}
        busy={busy}
        onAddProspect={() => setProspectFormOpen(true)}
        onAdvance={(p, next, extra) => runAction(() => {
          if (next === 'customer') trackEvent('customer_logged');
          return advanceProspect(launch.quest, p, next, extra);
        })}
        onLogCustomer={() => setCustomerFormOpen(true)}
      />

      <SideQuests
        doneKeys={doneSides}
        busy={busy}
        onComplete={(key) => runAction(() => {
          trackEvent('side_quest_completed', { side_quest: key });
          return completeSideQuest(launch.quest, grow.growState, key);
        })}
      />

      <AskHustleDrop
        onUsed={() => trackEvent('ask_hustledrop_used')}
        examples={GROW_EXAMPLES}
        description="Advice for growing — HustleDrop knows your business, pipeline, customers and HustleDNA. Advice only: it never changes your records."
        placeholder="Ask about growing your business…"
      />

      {growStats.customers >= 5 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center">
          <div className="font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">NEXT CHAPTER</div>
          <h3 className="mt-2 text-lg font-bold text-gradient">OPTIMIZE &amp; SCALE</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            The next world — turning five customers into a repeatable, growing operation — is in development. Keep
            running your loop; your progress is saved.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-foreground/90">
          {error}
        </p>
      )}

      {openDef && (
        <GrowMissionPanel
          def={openDef}
          mission={missionRecord(openDef.type)}
          wins={grow.wins}
          equipped={equippedFor(openDef.type)}
          busy={busy}
          onClose={() => setOpenMission(null)}
          actions={{ ...actions, ...activeMilestoneDef }}
        />
      )}

      <CustomerForm
        open={customerFormOpen}
        busy={busy}
        onClose={() => setCustomerFormOpen(false)}
        onSubmit={(data) =>
          runAction(() => {
            trackEvent('customer_logged');
            return logGrowCustomer(launch.quest, data);
          })
        }
      />

      <ProspectForm
        open={prospectFormOpen}
        busy={busy}
        onClose={() => setProspectFormOpen(false)}
        onSubmit={(data) =>
          runAction(() => {
            trackEvent('prospect_added');
            return addProspect(launch.quest, data);
          })
        }
      />

      {milestone && (
        <MilestoneOverlay type={milestone} summary={milestoneSummary} onClose={closeMilestone} />
      )}

      <DailyVictoryOverlay victory={victory} avatar={build.avatar} onClose={() => setVictory(null)} />

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
    </div>
  );
}