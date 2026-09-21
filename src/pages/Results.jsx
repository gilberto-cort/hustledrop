import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { trackEvent } from '@/lib/analytics';
import { loadSession } from '@/lib/quizStore';
import EmptyState from '@/components/EmptyState';
import { Target, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Results() {
  const { isAuthenticated } = useAuth();
  const [profileReady, setProfileReady] = useState(() => !!loadSession()?.completed);

  useEffect(() => {
    trackEvent('result_viewed');
  }, []);

  // Cross-device: a signed-in user with a completed server profile is also "ready"
  useEffect(() => {
    if (!profileReady && isAuthenticated) {
      base44.entities.HustleProfile.list('-created_date', 1)
        .then((rows) => {
          if (rows && rows.length > 0 && rows[0].profile_complete) {
            setProfileReady(true);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, profileReady]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">MATCH</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your matches</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Business models aligned with your circumstances will appear here once the matching engine
          is installed.
        </p>
      </div>

      {profileReady ? (
        <EmptyState
          icon={CheckCircle2}
          title="Your profile is ready"
          description="Your HustleMatch answers are saved. The engine that compares them against real business models is coming in a future build — no match results are shown before they're real."
          action={
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-medium text-foreground transition hover:border-white/30"
            >
              Review my answers
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <EmptyState
          icon={Target}
          title="No matches yet"
          description="Complete HustleMatch to see realistic business models ranked to your profile. We never fabricate results."
          action={
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              Start HustleMatch
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      )}
    </div>
  );
}