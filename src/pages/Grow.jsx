import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Rocket, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EmptyState from '@/components/EmptyState';

// GROW MODE — transition state only for now. Visible but locked until the
// first customer; after that, the unlock screen (full system in a future
// update).
export default function Grow() {
  const [state, setState] = useState('loading'); // loading | locked | unlocked

  useEffect(() => {
    (async () => {
      try {
        const wins = await base44.entities.CustomerWin.list('-created_date', 1);
        setState(wins && wins.length > 0 ? 'unlocked' : 'locked');
      } catch (e) {
        setState('locked');
      }
    })();
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (state === 'locked') {
    return (
      <EmptyState
        icon={Sprout}
        title="GROW MODE LOCKED"
        description="Grow unlocks after your first customer. First prove the offer, then HustleDrop helps you make the process repeatable."
        action={
          <Link to="/launch" className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white">
            ENTER LAUNCH MODE
            <Rocket className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div>
        <div className="inline-block rounded-full border border-primary/40 bg-brand-gradient-soft px-4 py-1.5 font-mono text-[10px] font-bold tracking-[0.3em] text-primary">
          NEW AREA UNLOCKED
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gradient">GROW MODE</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          "Your mission has changed. You proved someone will pay. Now let's build a repeatable way to find more
          customers."
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Your first customer unlocked this area. The full Grow system — repeatable outreach, referrals and systems —
          arrives in the next update. Until then, keep running your Launch missions: every new customer makes Grow
          easier.
        </p>
      </div>
      <Link
        to="/launch"
        className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white"
      >
        BACK TO LAUNCH MODE
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}