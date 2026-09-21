import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Target, ArrowRight } from 'lucide-react';

export default function Results() {
  useEffect(() => {
    trackEvent('result_viewed');
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">MATCH</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your matches</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Business models aligned with your circumstances will appear here once you complete HustleMatch.
        </p>
      </div>

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
    </div>
  );
}