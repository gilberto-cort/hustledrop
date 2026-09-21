import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Compass, ArrowRight } from 'lucide-react';

export default function Discover() {
  useEffect(() => {
    trackEvent('quiz_started');
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">DISCOVER</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">HustleMatch</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Answer a short set of questions to learn your HustleDNA and find businesses that fit your life.
        </p>
      </div>

      <EmptyState
        icon={Compass}
        title="HustleMatch is being prepared"
        description="The guided discovery experience will live here. For now, this is a placeholder — no results are fabricated."
        action={
          <Link
            to="/results"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-medium text-foreground transition hover:border-white/30"
          >
            View results area
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    </div>
  );
}