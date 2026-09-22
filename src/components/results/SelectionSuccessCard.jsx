import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Lock } from 'lucide-react';

// BUSINESS SELECTED confirmation. No Business Builder generation, no payment —
// BUILD MY BUSINESS is a clearly-marked future placeholder.
export default function SelectionSuccessCard({ businessName }) {
  const navigate = useNavigate();
  return (
    <section className="rounded-2xl border-2 border-primary/40 bg-brand-gradient-soft p-6 text-center glow-primary">
      <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
      <div className="mt-3 text-xs font-semibold tracking-[0.25em] text-muted-foreground">BUSINESS SELECTED</div>
      <h2 className="mt-1 text-xl font-semibold text-foreground">{businessName}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Good. Now we know what we're building around.</p>
      <div className="mt-5 space-y-2.5">
        <Button
          onClick={() => navigate('/dashboard')}
          className="w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white"
        >
          VIEW MY DASHBOARD
        </Button>
        <div className="flex items-center justify-center gap-2 rounded-full border border-dashed border-white/25 px-4 py-2.5 text-xs font-semibold tracking-wider text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          BUILD MY BUSINESS — COMING SOON
        </div>
      </div>
    </section>
  );
}