import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import DnaDashboardCard from '@/components/dna/DnaDashboardCard';
import MatchStatusCard from '@/components/dashboard/MatchStatusCard';
import BuilderProgressCard from '@/components/dashboard/BuilderProgressCard';
import JourneyProgress from '@/components/dashboard/JourneyProgress';

export default function Dashboard() {
  const [selection, setSelection] = useState(undefined); // undefined = loading, null = none
  const [flags, setFlags] = useState(null);
  const [builder, setBuilder] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profiles, dnaProfiles, matchResults, selections] = await Promise.all([
          base44.entities.HustleProfile.list('-created_date', 1).catch(() => []),
          base44.entities.HustleDNAProfile.list('-created_date', 1).catch(() => []),
          base44.entities.MatchResult.list('-created_date', 1).catch(() => []),
          base44.entities.SelectedBusiness.list('-created_date', 1).catch(() => []),
        ]);
        if (cancelled) return;

        const profile = profiles?.[0];
        const selected = selections?.[0];

        let sel = null;
        if (selected) {
          try {
            const model = await base44.entities.BusinessModel.get(selected.business_model_id);
            let fit = null;
            try {
              const mr = await base44.entities.MatchResult.filter(
                { business_model_id: selected.business_model_id },
                '-created_date',
                1
              );
              fit = mr?.[0]?.personal_fit ?? null;
            } catch (e) {
              // fit is optional display data
            }
            sel = { name: model.name, fit };
          } catch (e) {
            sel = null;
          }

          try {
            const acc = await base44.entities.GeneratedAsset.filter(
              { selected_business_id: selected.id, status: 'accepted' },
              '-created_date',
              100
            );
            const modulesDone = new Set((acc || []).map((a) => a.module_type)).size;
            if (!cancelled) {
              setBuilder({
                percent: Math.round((modulesDone / 7) * 100),
                started: (acc || []).length > 0,
              });
            }
          } catch (e) {
            if (!cancelled) setBuilder(null);
          }
        }

        setSelection(sel);
        setFlags({
          discover: !!profile?.profile_complete,
          dna: (dnaProfiles || []).length > 0,
          match: (matchResults || []).length > 0,
        });
      } catch (e) {
        if (!cancelled) {
          setSelection(null);
          setFlags({ discover: false, dna: false, match: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is your HustleDrop base — your identity, your matches and your next move.
        </p>
      </div>

      <DnaDashboardCard />

      {flags && selection !== undefined && <MatchStatusCard selection={selection} hasMatches={flags.match} />}

      {builder && selection && <BuilderProgressCard percent={builder.percent} started={builder.started} />}

      {flags && (
        <JourneyProgress
          discover={flags.discover}
          dna={flags.dna}
          match={flags.match}
          selected={!!selection}
          buildDone={builder ? builder.percent === 100 : false}
        />
      )}
    </div>
  );
}