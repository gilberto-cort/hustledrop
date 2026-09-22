import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Dna, ArrowRight } from 'lucide-react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import { DNA_TYPES, STRENGTHS, levelName } from '@/lib/dnaDisplay';

// Dashboard HustleDNA card. The DNA record is passed in from the Dashboard's
// single authoritative load (server records are the source of truth) — this
// card never fetches its own DNA and never shows the "discover" CTA unless the
// server has definitively confirmed no DNA exists. The sprite slot stays
// reserved for the upcoming avatar system.
export default function DnaDashboardCard({ dna, loading = false }) {
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (!dna) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        if (!cancelled && me && me.selected_avatar_id) {
          setAvatar(await base44.entities.Avatar.get(me.selected_avatar_id));
        }
      } catch (e) {
        // the sprite is cosmetic — the labelled placeholder covers it
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dna ? dna.id : null]);

  if (loading) {
    return <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />;
  }

  if (!dna) {
    return (
      <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
            <Dna className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">HustleDNA</span>
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">Discover your entrepreneur type</h3>
        <p className="mt-1 text-sm text-muted-foreground">Take HustleMatch to reveal your HustleDNA profile.</p>
        <Link to="/discover" className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary transition hover:gap-2">
          Go to DISCOVER <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const primary = DNA_TYPES[dna.primary_type];
  const secondary = DNA_TYPES[dna.secondary_type];
  const strengthList = (dna.strengths || []).slice(0, 2).map((s) => STRENGTHS[s]).filter(Boolean);

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-3">
        <SpriteDisplay avatar={avatar} size="sm" />
        <div>
          <div className="font-mono text-[9px] font-bold tracking-widest text-primary">
            LEVEL {avatar?.level || 1} · {levelName(avatar?.level).toUpperCase()}
          </div>
          <span className={`font-mono text-sm font-bold ${primary.accent}`}>{primary.label}</span>
        </div>
      </div>
      <div className="mt-4 inline-block w-fit rounded border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs font-bold tracking-widest">
        {dna.hustle_code}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Secondary: {secondary?.label}
        {strengthList.length > 0 ? ` · ${strengthList.join(', ')}` : ''}
      </p>
      <Link to="/hustledna" className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary transition hover:gap-2">
        VIEW MY HUSTLEDNA <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}