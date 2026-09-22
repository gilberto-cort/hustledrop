import React from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowRight } from 'lucide-react';

// YOUR HUSTLEMATCH — the selected business and its Personal Fit, or a prompt
// to view the ready matches.
export default function MatchStatusCard({ selection, hasMatches }) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
          <Target className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">YOUR HUSTLEMATCH</span>
      </div>

      {selection ? (
        <>
          <h3 className="mt-4 text-lg font-semibold text-foreground">{selection.name}</h3>
          {selection.fit != null && (
            <div className="mt-1 flex items-end gap-2">
              <span className="text-2xl font-bold text-gradient">{selection.fit}%</span>
              <span className="pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground">PERSONAL FIT</span>
            </div>
          )}
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Personal Fit is compatibility with your stated circumstances — not a prediction of success or income.
          </p>
          <Link
            to="/results"
            className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary transition hover:gap-2"
          >
            VIEW MY MATCHES <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : hasMatches ? (
        <>
          <h3 className="mt-4 text-base font-semibold text-foreground">Your matches are ready.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            See the businesses that fit your practical circumstances and choose one to explore.
          </p>
          <Link
            to="/results"
            className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            VIEW MATCHES <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      ) : (
        <>
          <h3 className="mt-4 text-base font-semibold text-foreground">No matches yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete HustleMatch to see the business models that fit you.
          </p>
          <Link
            to="/discover"
            className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            START HUSTLEMATCH <ArrowRight className="h-4 w-4" />
          </Link>
        </>
      )}
    </div>
  );
}