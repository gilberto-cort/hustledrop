import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// Small HustleDNA section for the HustleMatch results page. Shows the user's
// DNA mix without touching Personal Fit scores or rankings.
export default function DnaResultSection() {
  const [dna, setDna] = useState(null);

  useEffect(() => {
    base44.functions.invoke('hustleDna', {})
      .then((res) => {
        if (res.data?.status === 'ok' && res.data.dna) setDna(res.data.dna);
      })
      .catch(() => {});
  }, []);

  if (!dna) return null;

  const primary = DNA_TYPES[dna.primary_type];
  const secondary = DNA_TYPES[dna.secondary_type];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">YOUR HUSTLEDNA</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className={`font-mono text-sm font-bold ${primary.accent}`}>{primary.label}</span>
        {secondary && (
          <>
            <span className="text-xs text-muted-foreground">+</span>
            <span className={`font-mono text-sm ${secondary.accent}`}>{secondary.label}</span>
          </>
        )}
      </div>
      <div className="mt-2 inline-block rounded border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs font-bold tracking-widest">
        {dna.hustle_code}
      </div>
    </div>
  );
}