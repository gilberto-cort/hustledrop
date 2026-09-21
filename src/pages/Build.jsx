import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import { Hammer, ArrowRight } from 'lucide-react';

export default function Build() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">BUILD</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Business Builder</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Turn your strongest match into an actual business concept — brand, offer and plan.
        </p>
      </div>

      <EmptyState
        icon={Hammer}
        title="No business selected to build"
        description="Select a business from your matches to unlock the Business Builder. Access may require an account."
        action={
          <Link
            to="/results"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-medium text-foreground transition hover:border-white/30"
          >
            View your matches
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    </div>
  );
}