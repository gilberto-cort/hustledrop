import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Dna, ArrowRight } from 'lucide-react';
import SpriteDisplay from '@/components/dna/SpriteDisplay';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// Dashboard HustleDNA card: selected sprite, primary type, Hustle Code,
// secondary type and a VIEW MY HUSTLEDNA link. All six scores stay on the
// dedicated screen — the dashboard stays clean.
export default function DnaDashboardCard() {
  const [state, setState] = useState('loading'); // loading | ready | none
  const [dna, setDna] = useState(null);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('hustleDna', {});
        if (res.data?.status !== 'ok' || !res.data.dna) { setState('none'); return; }
        setDna(res.data.dna);
        const me = await base44.auth.me().catch(() => null);
        if (me?.selected_avatar_id) {
          try { setAvatar(await base44.entities.Avatar.get(me.selected_avatar_id)); } catch (e) {}
        }
        setState('ready');
      } catch (e) {
        setState('none');
      }
    })();
  }, []);

  if (state === 'loading') {
    return <div className="h-52 animate-pulse rounded-2xl border border-white/10 bg-white/[0.02]" />;
  }

  if (state === 'none') {
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

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-3">
        <SpriteDisplay avatar={avatar} size="sm" />
        <div>
          <div className="font-mono text-[9px] font-bold tracking-widest text-primary">LEVEL 1 · EXPLORER</div>
          <span className={`font-mono text-sm font-bold ${primary.accent}`}>{primary.label}</span>
        </div>
      </div>
      <div className="mt-4 inline-block w-fit rounded border border-white/15 bg-white/5 px-2.5 py-1 font-mono text-xs font-bold tracking-widest">
        {dna.hustle_code}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Secondary: {secondary?.label}</p>
      <Link to="/hustledna" className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary transition hover:gap-2">
        VIEW MY HUSTLEDNA <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}