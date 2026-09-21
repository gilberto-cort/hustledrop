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
import TieBreakerDialog from '@/components/results/TieBreakerDialog';
import { getProfileForUser, getActiveModels, getOrCreateMatchResults, buildMatchView, selectBusiness } from '@/lib/matchService';
import { findTieBreaker, applyTieBreaker, computeConfidence } from '@/lib/matchingEngine';

export default function Results() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading'); // loading | analyzing | ready | no-profile | empty
  const [matches, setMatches] = useState([]);
  const [confidence, setConfidence] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tie, setTie] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    trackEvent('result_viewed');
    (async () => {
      try {
        const p = await getProfileForUser();
        if (!p || !p.profile_complete) { setPhase('no-profile'); return; }
        const models = await getActiveModels();
        if (!models || models.length === 0) { setPhase('empty'); return; }
        const { results } = await getOrCreateMatchResults(p, models);
        const view = buildMatchView(results, models);
        if (view.length === 0) { setPhase('empty'); return; }
        setProfile(p);
        setMatches(view);
        setConfidence(computeConfidence(p));
        setPhase('analyzing');
      } catch (e) {
        setPhase('empty');
      }
    })();
  }, []);

  const handleAnalysisDone = () => {
    setPhase('ready');
    const t = findTieBreaker(matches[0], matches[1]);
    if (t) {
      setTimeout(() => {
        setTie(t);
        trackEvent('tie_breaker_presented', { business_model_id: matches[0].model.id });
      }, 800);
    }
  };

  const handleTieAnswer = async (chosenId) => {
    const [a2, b2] = applyTieBreaker(matches[0], matches[1], tie.key, chosenId);
    const ranked = a2.fit >= b2.fit ? [[a2, 1], [b2, 2]] : [[b2, 1], [a2, 2]];
    try {
      await base44.entities.MatchResult.bulkUpdate(ranked.map(([s, r]) => ({
        id: s.result.id,
        rank: r,
        personal_fit: Math.round(s.fit),
        tie_breaker_used: tie.key,
      })));
    } catch (e) { /* keep local result even if persist fails */ }
    trackEvent('tie_breaker_completed', { business_model_id: chosenId });
    setMatches((prev) => {
      const rest = prev.slice(2);
      const [first, second] = ranked.map(([s, r]) => ({ ...s, rank: r, fit: Math.round(s.fit) }));
      return [first, second, ...rest];
    });
    setTie(null);
  };

  const handleBuild = async () => {
    const primary = matches[0];
    try {
      await selectBusiness(user, primary);
    } catch (e) { /* selection UI feedback is added with the Builder build */ }
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
      <TieBreakerDialog open={!!tie} onOpenChange={() => setTie(null)} tie={tie} onAnswer={handleTieAnswer} />
    </div>
  );
}