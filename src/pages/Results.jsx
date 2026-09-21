import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Target, ArrowRight } from 'lucide-react';
import MatchAnalysisAnimation from '@/components/results/MatchAnalysisAnimation';
import PrimaryMatchCard from '@/components/results/PrimaryMatchCard';
import AltMatchCard from '@/components/results/AltMatchCard';
import CompareMatchesModal from '@/components/results/CompareMatchesModal';
import { selectBusiness } from '@/lib/matchService';

export default function Results() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading'); // loading | analyzing | ready | no-profile | empty
  const [matches, setMatches] = useState([]);
  const [confidence, setConfidence] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    trackEvent('result_viewed');
    (async () => {
      try {
        // The deterministic engine runs server-side: profile → hard filters →
        // scoring → ranking → persisted MatchResults → top 3 returned.
        const res = await base44.functions.invoke('matchEngine', {});
        const data = res.data;
        if (!data || data.status === 'no_profile') { setPhase('no-profile'); return; }

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
        if (view.length === 0) { setPhase('empty'); return; }

        setMatches(view);
        setConfidence(data.confidence);
        setPhase('analyzing');
      } catch (e) {
        setPhase('empty');
      }
    })();
  }, []);

  const handleAnalysisDone = () => setPhase('ready');

  const handleBuild = async () => {
    const primary = matches[0];
    try {
      await selectBusiness(user, primary);
    } catch (e) { /* selection feedback is added with the Business Builder build */ }
    trackEvent('business_selected', { business_model_id: primary.model.id, rank: 1 });
    navigate('/build');
  };

  const handleRematch = () => {
    trackEvent('rematch_started');
    navigate('/discover');
  };

  const handleShare = async () => {
    const primary = matches[0];
    const text = `My top HustleDrop match: ${primary.model.name} — ${primary.fit}% Personal Fit. `
      + `That means compatibility with my budget, skills and schedule — not a prediction of success. `
      + `Find your match with HustleDrop.`;
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch (e) { /* clipboard unavailable */ }
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
    return <MatchAnalysisAnimation onComplete={handleAnalysisDone} />;
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
          title="No matches yet"
          description="Complete HustleMatch to see realistic business models ranked to your profile. We never fabricate results."
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

  if (phase === 'empty') {
    return (
      <EmptyState
        icon={Target}
        title="Matches unavailable right now"
        description="We couldn't load business models to compare against your profile. Please try again shortly."
      />
    );
  }

  const primary = matches[0];
  const alternates = matches.slice(1);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <PrimaryMatchCard
        match={primary}
        confidence={confidence}
        onBuild={handleBuild}
        onCompare={() => setCompareOpen(true)}
        onRematch={handleRematch}
        onShare={handleShare}
        shared={shared}
      />

      {alternates.length > 0 && (
        <div>
          <div className="mb-3 text-xs font-semibold tracking-[0.25em] text-muted-foreground">OTHER MATCHES</div>
          <div className="space-y-3">
            {alternates.map((match) => (
              <AltMatchCard key={match.model.id} match={match} />
            ))}
          </div>
        </div>
      )}

      <CompareMatchesModal open={compareOpen} onOpenChange={setCompareOpen} matches={matches.slice(0, 3)} />
    </div>
  );
}