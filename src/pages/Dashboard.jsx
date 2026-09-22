import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BUILD_MODULES } from '@/lib/builderService';
import { getNextMove } from '@/lib/nextMove';
import { resolveProgression, WELCOME } from '@/lib/progression';
import { hasEntitlement } from '@/lib/paymentService';
import { DNA_TYPES } from '@/lib/dnaDisplay';
import DnaDashboardCard from '@/components/dna/DnaDashboardCard';
import JourneyProgress from '@/components/dashboard/JourneyProgress';
import NextMoveCard from '@/components/dashboard/NextMoveCard';
import StatCards from '@/components/dashboard/StatCards';
import EmptyState from '@/components/EmptyState';
import { RotateCcw } from 'lucide-react';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

// ACTION DASHBOARD — one greeting, one business, one NEXT MOVE. Everything
// derives from ONE progression resolver over real persisted records, so the
// stage badge, Journey, Next Move and level display can never disagree.
export default function Dashboard() {
  const [data, setData] = useState(null); // null = loading
  const [failed, setFailed] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profiles, dnaProfiles, matchResults, selections, wins, quests, achievements] = await Promise.all([
          base44.entities.HustleProfile.list('-created_date', 1).catch(() => []),
          base44.entities.HustleDNAProfile.list('-created_date', 1).catch(() => []),
          base44.entities.MatchResult.list('-created_date', 10).catch(() => []),
          base44.entities.SelectedBusiness.list('-selected_at', 1).catch(() => []),
          base44.entities.CustomerWin.list('-created_date', 200).catch(() => []),
          base44.entities.LaunchQuest.list('-created_date', 1).catch(() => []),
          base44.entities.Achievement.list('-created_date', 100).catch(() => []),
        ]);
        if (cancelled) return;
        const selected = (selections || [])[0] || null;

        let model = null;
        let fit = null;
        let entitled = false;
        let acceptedModules = [];
        if (selected) {
          try {
            model = await base44.entities.BusinessModel.get(selected.business_model_id);
          } catch (e) {
            model = null;
          }
          const mr = (matchResults || []).find((r) => r.business_model_id === selected.business_model_id);
          fit = mr ? mr.personal_fit : null;
          entitled = await hasEntitlement(selected.id).catch(() => false);
          try {
            const acc = await base44.entities.GeneratedAsset.filter(
              { selected_business_id: selected.id, status: 'accepted' },
              '-created_date',
              100
            );
            acceptedModules = [...new Set((acc || []).map((a) => a.module_type))];
          } catch (e) {
            acceptedModules = [];
          }
        }
        if (cancelled) return;

        setData({
          profile: (profiles || [])[0] || null,
          dna: (dnaProfiles || [])[0] || null,
          hasMatch: (matchResults || []).length > 0,
          selected,
          model,
          fit,
          entitled,
          acceptedModules,
          quest: (quests || [])[0] || null,
          customers: (wins || []).length,
          achievements: (achievements || []).length,
        });
      } catch (e) {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  // ONE resolver — Dashboard, Journey, Next Move and level/XP all read this.
  const progression = useMemo(() => (data ? resolveProgression(data) : null), [data]);
  const move = useMemo(() => (progression ? getNextMove(progression) : null), [progression]);

  if (failed) {
    return (
      <EmptyState
        icon={RotateCcw}
        title="Dashboard unavailable right now"
        description="We couldn't load your progress. Nothing was lost — you can safely try again."
        action={
          <button
            onClick={() => {
              setFailed(false);
              setLoadKey((k) => k + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        }
      />
    );
  }

  if (!data || !progression || !move) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  const welcome = WELCOME[progression.stage] || WELCOME.DISCOVER;
  const primaryDna = data.dna ? DNA_TYPES[data.dna.primary_type] : null;
  const businessName =
    (data.selected && data.model && data.model.name) || (primaryDna ? `${primaryDna.label}'s next venture` : 'Your business');
  const buildPercent = Math.min(100, Math.round((data.acceptedModules.length / BUILD_MODULES.length) * 100));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{greeting()}</h1>
        <p className="mt-1 text-base font-semibold tracking-tight text-foreground sm:text-lg">{welcome.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{welcome.body}</p>
      </div>

      <NextMoveCard
        businessName={businessName}
        modelFamily={data.model ? data.model.family : null}
        fit={data.fit}
        dna={data.dna ? data.dna.hustle_code : null}
        stage={progression.stage}
        move={move}
      />

      <StatCards
        level={progression.level}
        levelLabel={progression.levelLabel}
        xp={progression.xp}
        questStage={data.quest ? data.quest.current_stage : null}
        buildPercent={buildPercent}
        customers={data.customers}
        achievements={data.achievements}
      />

      {/* DNA comes from the Dashboard's single authoritative load — the card
          never re-guesses and never shows the retake CTA for an existing DNA. */}
      <DnaDashboardCard dna={data.dna} loading={false} />

      <JourneyProgress journey={progression.journey} stage={progression.stage} />
    </div>
  );
}