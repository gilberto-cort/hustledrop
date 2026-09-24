import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CityMap from '@/components/city/CityMap';
import DistrictDetail from '@/components/city/DistrictDetail';
import { DISTRICTS, deriveDistrictStates } from '@/components/city/districtManifest';
import { BUILD_MODULES } from '@/lib/builderService';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import EmptyState from '@/components/EmptyState';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// ============================================================
// THE CITY — the playable map over the existing five-district journey.
// Every district state is DERIVED from the user's real persisted records
// (the same records Dashboard/Launch/Grow read) via the district manifest
// — the city persists NOTHING and adds no progression system.
// Selecting a district only opens its detail panel; nothing is unlocked
// or changed by viewing. City tiles stay icon-based until real artwork
// is uploaded (CITY_ASSETS_ACTIVE unchanged).
// ============================================================
export default function City() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading');
  const [data, setData] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dnaProfiles, selections, wins, quests, me, avatars] = await Promise.all([
          base44.entities.HustleDNAProfile.list('-created_date', 1).catch(() => []),
          base44.entities.SelectedBusiness.list('-selected_at', 1).catch(() => []),
          base44.entities.CustomerWin.list('-created_date', 200).catch(() => []),
          base44.entities.LaunchQuest.list('-created_date', 1).catch(() => []),
          base44.auth.me().catch(() => null),
          base44.entities.Avatar.list('display_name', 100).catch(() => []),
        ]);
        const selected = (selections || [])[0] || null;
        const quest = (quests || [])[0] || null;
        const dna = (dnaProfiles || [])[0] || null;
        const customers = (wins || []).length;

        let acceptedModules = [];
        if (selected) {
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

        let systemDone = false;
        if (quest) {
          try {
            const missions = await base44.entities.GrowMission.filter({ launch_quest_id: quest.id }, '-created_date', 100);
            systemDone = (missions || []).some((m) => m.mission_type === 'system' && m.status === 'completed');
          } catch (e) {
            systemDone = false;
          }
        }

        if (cancelled) return;
        const states = deriveDistrictStates({
          hasDna: !!dna,
          hasSelection: !!selected,
          buildComplete: BUILD_MODULES.every((m) => acceptedModules.includes(m.key)),
          launchComplete: quest ? quest.status === 'completed' : false,
          growComplete: customers >= 5 && systemDone,
        });
        setData({
          states,
          dna,
          avatar: me?.selected_avatar_id
            ? (avatars || []).find((a) => a.id === me.selected_avatar_id) || null
            : null,
          progress: {
            hasDna: !!dna,
            hasSelection: !!selected,
            acceptedCount: acceptedModules.length,
            totalModules: BUILD_MODULES.length,
            hasFirstCustomer: customers > 0,
            streak: quest ? quest.streak : 0,
            customers,
            systemDone,
          },
        });
        setPhase('ready');
      } catch (e) {
        console.error('[City] load failed', e);
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <EmptyState
        icon={MapPin}
        title="The city couldn't be loaded right now"
        description="Nothing was lost — this looks like a temporary connection problem. Try again."
        action={
          <button
            onClick={() => {
              setPhase('loading');
              setLoadKey((k) => k + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" /> RETRY
          </button>
        }
      />
    );
  }

  const { states, dna, avatar, progress } = data;
  const district = DISTRICTS.find((d) => d.key === selectedKey) || null;
  const dnaMeta = dna ? DNA_TYPES[dna.primary_type] : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">NEON HUSTLE CITY</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your hustle, mapped</h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Five districts, one journey. Each one opens through real progress — your DNA, build, launch and customer
          records decide what lights up.
        </p>
      </div>

      {(avatar || dnaMeta) && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
          {avatar && <SpriteDisplay avatar={avatar} size="sm" />}
          <div className="min-w-0">
            <div className="font-mono text-xs font-bold tracking-wider text-foreground">
              {avatar ? avatar.display_name : dnaMeta.label}
            </div>
            <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              {dnaMeta ? `${dnaMeta.label} — ${dnaMeta.core}` : 'Your selected character walks these streets.'}
            </div>
          </div>
        </div>
      )}

      <CityMap states={states} onSelect={(key) => setSelectedKey(key)} />

      {district ? (
        <DistrictDetail
          district={district}
          state={states[district.key] || 'locked'}
          progress={progress}
          onNavigate={(path) => navigate(path)}
        />
      ) : (
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Tap a district to see its purpose, opportunities, challenges and your progress.
        </p>
      )}
    </div>
  );
}