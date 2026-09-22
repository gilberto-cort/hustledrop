import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Dna as DnaIcon, ArrowRight, Share2, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DNA_TYPES } from '@/lib/dnaDisplay';
import DnaTypeHeader from '@/components/dna/DnaTypeHeader';
import DnaBuildStyle from '@/components/dna/DnaBuildStyle';
import DnaStrengthsTraps from '@/components/dna/DnaStrengthsTraps';
import DnaSectionCard from '@/components/dna/DnaSectionCard';
import DnaDimensionsPanel from '@/components/dna/DnaDimensionsPanel';
import DnaScoresPanel from '@/components/dna/DnaScoresPanel';
import CharacterPicker from '@/components/dna/CharacterPicker';
import SelectedCharacterBanner from '@/components/dna/SelectedCharacterBanner';
import DnaShareCard from '@/components/dna/DnaShareCard';

export default function HustleDNA() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading'); // loading | ready | none | error
  const [dna, setDna] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('hustleDna', {});
        const data = res.data;
        if (!data || data.status === 'no_profile' || !data.dna) { setPhase('none'); return; }
        setDna(data.dna);
        if (data.created) trackEvent('dna_generated');
        trackEvent('dna_viewed');
        const [rows, me] = await Promise.all([
          base44.entities.Avatar.list('display_name', 100),
          base44.auth.me().catch(() => null),
        ]);
        setAvatars(rows || []);
        setSelectedAvatarId(me?.selected_avatar_id || null);
        setPhase('ready');
      } catch (e) {
        // Transient fetch failure ≠ missing DNA. The persisted record is
        // never touched — RETRY re-reads it, never prompts a recalculation.
        console.error('[HustleDNA] load failed', e);
        setPhase('error');
      }
    })();
  }, [loadKey]);

  const handleSelectAvatar = async (avatarId) => {
    await base44.auth.updateMe({ selected_avatar_id: avatarId });
    setSelectedAvatarId(avatarId);
    trackEvent('avatar_selected', { dna_type: dna.primary_type });
  };

  const handleShare = async () => {
    setShareOpen(true);
    const primary = DNA_TYPES[dna.primary_type];
    trackEvent('dna_shared', { dna_type: dna.primary_type });
    const text = `My HustleDNA: ${primary.label} (${dna.hustle_code}) — a work-style profile, not a personality test or success prediction. What's your HustleDNA?`;
    try { await navigator.clipboard.writeText(text); } catch (e) {}
  };

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">HUSTLEDNA</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your entrepreneurial work-style profile</h1>
        </div>
        <EmptyState
          icon={DnaIcon}
          title="Your HustleDNA couldn't be loaded right now"
          description="It's saved to your account — this looks like a temporary connection problem. Nothing was lost and no recalculation is needed."
          action={
            <button
              onClick={() => {
                setPhase('loading');
                setLoadKey((k) => k + 1);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              <RotateCcw className="h-4 w-4" />
              RETRY
            </button>
          }
        />
      </div>
    );
  }

  if (phase === 'none') {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">HUSTLEDNA</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your entrepreneurial work-style profile</h1>
        </div>
        <EmptyState
          icon={DnaIcon}
          title="No HustleDNA yet"
          description="Complete HustleMatch and your answers will reveal your HustleDNA — how you may prefer to build and operate a business."
          action={
            <button
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              Start HustleMatch
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
      </div>
    );
  }

  const primaryAvatars = avatars.filter((a) => a.dna_type === dna.primary_type && a.active !== false);
  const chosenAvatar = avatars.find((a) => a.id === selectedAvatarId) || null;
  const selectedAvatar = chosenAvatar || primaryAvatars[0] || null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {chosenAvatar && <SelectedCharacterBanner avatar={chosenAvatar} dnaType={dna.primary_type} />}
      <DnaTypeHeader dna={dna} />
      <DnaBuildStyle dna={dna} />
      <DnaStrengthsTraps dna={dna} />

      <DnaSectionCard title="YOUR SIX DIMENSIONS">
        <DnaDimensionsPanel dimensions={dna.dimensions} />
      </DnaSectionCard>

      <DnaSectionCard title="YOUR HUSTLEDNA SCORES">
        <DnaScoresPanel scores={dna.scores} />
      </DnaSectionCard>

      <CharacterPicker
        dnaType={dna.primary_type}
        avatars={primaryAvatars}
        selectedAvatarId={selectedAvatarId}
        onSelect={handleSelectAvatar}
      />

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={handleShare} className="rounded-full bg-brand-gradient text-xs font-semibold text-white">
          <Share2 className="mr-1.5 h-3.5 w-3.5" /> SHARE MY HUSTLEDNA
        </Button>
        <Link
          to="/results"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold text-foreground transition hover:border-white/30"
        >
          VIEW MY HUSTLEMATCHES <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-sm border-white/10 bg-card">
          <DnaShareCard dna={dna} avatar={selectedAvatar} />
          <p className="mt-3 text-center text-[10px] text-muted-foreground">Share text copied to your clipboard.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}