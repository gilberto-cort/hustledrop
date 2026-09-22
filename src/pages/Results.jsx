import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Target, ArrowRight, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import MatchAnalysisAnimation from '@/components/results/MatchAnalysisAnimation';
import ResultHero from '@/components/results/ResultHero';
import WhyThisFitsSection from '@/components/results/WhyThisFitsSection';
import TradeoffSection from '@/components/results/TradeoffSection';
import BusinessSnapshot from '@/components/results/BusinessSnapshot';
import DnaConnectionSection from '@/components/results/DnaConnectionSection';
import FirstMoveSection from '@/components/results/FirstMoveSection';
import SelectionSuccessCard from '@/components/results/SelectionSuccessCard';
import AltMatches from '@/components/results/AltMatches';
import CompareMatchesModal from '@/components/results/CompareMatchesModal';
import MatchShareCard from '@/components/results/MatchShareCard';
import { selectBusiness } from '@/lib/matchService';

export default function Results() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading'); // loading | analyzing | ready | no-profile | no-eligible | error
  const [loadKey, setLoadKey] = useState(0);
  const [matches, setMatches] = useState([]);
  const [confidence, setConfidence] = useState(null);
  const [dna, setDna] = useState(null);
  const [dnaError, setDnaError] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [hasChosenAvatar, setHasChosenAvatar] = useState(false);
  const [selection, setSelection] = useState(undefined); // undefined = loading, null = none
  const [selectBusy, setSelectBusy] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shared, setShared] = useState(false);

  const loadAvatarFor = async (dnaObj) => {
    try {
      const [rows, me] = await Promise.all([
        base44.entities.Avatar.list('display_name', 100),
        base44.auth.me().catch(() => null),
      ]);
      const all = rows || [];
      const chosen = all.find((a) => a.id === me?.selected_avatar_id) || null;
      const primaryAvatars = all.filter((a) => a.dna_type === dnaObj.primary_type && a.active !== false);
      setAvatar(chosen || primaryAvatars[0] || null);
      setHasChosenAvatar(!!chosen);
    } catch (e) {
      // hero falls back to a labelled placeholder on its own
    }
  };

  useEffect(() => {
    trackEvent('result_viewed');
    let cancelled = false;
    setPhase('loading');

    (async () => {
      // Deterministic pipeline: saved profile → server-side HustleDNA →
      // server-side match engine → animated reveal. No AI, no fabrication.
      try {
        const res = await base44.functions.invoke('matchEngine', {});
        const data = res.data;
        if (!data || data.status === 'no_profile') {
          if (!cancelled) setPhase('no-profile');
          return;
        }
        const view = (data.matches || []).map((m) => ({
          result: { id: m.result_id, rank: m.rank },
          model: m.business_model,
          fit: m.personal_fit,
          factors: (m.score_breakdown || {}).factors || {},
          penalties: (m.score_breakdown || {}).penalties || [],
          bonuses: (m.score_breakdown || {}).bonuses || [],
          positives: m.positive_factors || [],
          negatives: m.negative_factors || [],
          rank: m.rank,
        }));
        if (view.length === 0) {
          if (!cancelled) setPhase('no-eligible');
          return;
        }
        if (cancelled) return;
        setMatches(view);
        setConfidence(data.confidence);
        setPhase('analyzing');
      } catch (e) {
        if (!cancelled) setPhase('error');
        return;
      }

      // HustleDNA (independent — never blocks the match reveal)
      try {
        const d = await base44.functions.invoke('hustleDna', {});
        if (cancelled) return;
        if (d.data?.dna) {
          setDna(d.data.dna);
          loadAvatarFor(d.data.dna);
        } else {
          setDnaError(true);
        }
      } catch (e) {
        if (!cancelled) setDnaError(true);
      }

      // Existing selection (returning users)
      try {
        const sel = await base44.entities.SelectedBusiness.list('-created_date', 1);
        const rec = sel?.[0];
        if (rec && !cancelled) {
          const model = await base44.entities.BusinessModel.get(rec.business_model_id);
          if (!cancelled) setSelection({ name: model.name });
        } else if (!cancelled && !rec) {
          setSelection(null);
        }
      } catch (e) {
        if (!cancelled) setSelection(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  const retryDna = async () => {
    setDnaError(false);
    try {
      const d = await base44.functions.invoke('hustleDna', {});
      if (d.data?.dna) {
        setDna(d.data.dna);
        loadAvatarFor(d.data.dna);
      } else {
        setDnaError(true);
      }
    } catch (e) {
      setDnaError(true);
    }
  };

  const handleSelect = async (match) => {
    setSelectBusy(true);
    try {
      await selectBusiness(user, match);
      setSelection({ name: match.model.name });
      trackEvent('business_selected', { business_model_id: match.model.id, rank: match.rank });
    } catch (e) {
      // selection is retried by pressing the button again
    } finally {
      setSelectBusy(false);
    }
  };

  const handleRematch = () => {
    trackEvent('rematch_started');
    navigate('/discover');
  };

  const handleShare = async () => {
    const primary = matches[0];
    setShareOpen(true);
    const text = `My HustleMatch: ${primary.model.name} — ${primary.fit}% Personal Fit`
      + `${dna ? ` · HustleDNA ${dna.hustle_code}` : ''}. `
      + `Here's what matched me. What's your HustleMatch?`;
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch (e) {
      // clipboard unavailable — the share card can still be screenshotted
    }
    trackEvent('result_shared', { business_model_id: primary.model.id, rank: 1 });
  };

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (phase === 'analyzing') {
    return <MatchAnalysisAnimation onComplete={() => setPhase('ready')} />;
  }

  if (phase === 'no-profile') {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">MATCH</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your matches</h1>
        </div>
        <EmptyState
          icon={Target}
          title="Finish HustleMatch to see your results"
          description="Complete the questionnaire and your matches will be calculated from your answers — we never fabricate results."
          action={
            <button
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              Finish HustleMatch
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
      </div>
    );
  }

  if (phase === 'no-eligible') {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">MATCH</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your matches</h1>
        </div>
        <EmptyState
          icon={Target}
          title="We need to widen the search"
          description="No business models passed the eligibility filters for your current constraints. Review your answers — especially budget, available hours and required assets — and run it again. We never invent a match."
          action={
            <button
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              Review my answers
              <ArrowRight className="h-4 w-4" />
            </button>
          }
        />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <EmptyState
        icon={Target}
        title="Matches unavailable right now"
        description="We couldn't load your results. Nothing was lost — you can safely try again."
        action={
          <button
            onClick={() => setLoadKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        }
      />
    );
  }

  const primary = matches[0];
  const alternates = matches.slice(1, 3);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <ResultHero
        match={primary}
        confidence={confidence}
        dna={dna}
        avatar={avatar}
        hasChosenAvatar={hasChosenAvatar}
      />

      {dnaError && !dna && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-muted-foreground">Your HustleDNA couldn't be loaded right now.</p>
          <Button onClick={retryDna} variant="outline" className="rounded-full text-xs font-semibold">
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            RECALCULATE MY HUSTLEDNA
          </Button>
        </div>
      )}

      <WhyThisFitsSection match={primary} />
      <TradeoffSection match={primary} />
      <BusinessSnapshot match={primary} />
      <DnaConnectionSection dna={dna} />

      {selection ? (
        <SelectionSuccessCard businessName={selection.name} />
      ) : (
        <FirstMoveSection match={primary} onSelect={handleSelect} busy={selectBusy} />
      )}

      {alternates.length > 0 && <AltMatches matches={alternates} onSelect={handleSelect} />}

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => {
            setCompareOpen(true);
            trackEvent('comparison_opened');
          }}
          variant="outline"
          className="rounded-full py-3 text-xs font-semibold"
        >
          COMPARE MY TOP 3
        </Button>
        <Button onClick={handleShare} variant="outline" className="rounded-full py-3 text-xs font-semibold">
          {shared ? 'COPIED TO CLIPBOARD' : 'SHARE MY MATCH'}
        </Button>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">NOT FEELING IT?</div>
        <Button
          onClick={handleRematch}
          variant="outline"
          className="mt-3 rounded-full px-6 py-2.5 text-xs font-semibold"
        >
          REMATCH ME
        </Button>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Edit your answers and run it again — a new result set is created and your previous results stay in your
          history.
        </p>
      </section>

      <CompareMatchesModal open={compareOpen} onOpenChange={setCompareOpen} matches={matches.slice(0, 3)} />

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-sm border-white/10 bg-card">
          <MatchShareCard match={primary} dna={dna} avatar={avatar} />
          <p className="mt-3 text-center text-[10px] text-muted-foreground">Share text copied to your clipboard.</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}