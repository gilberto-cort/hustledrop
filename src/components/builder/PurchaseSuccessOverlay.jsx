import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

const PATH_STEPS = ['CUSTOMER', 'OFFER', 'PRICING', 'BRAND', 'SALES', 'MARKETING', 'LAUNCH'];

// ONBOARDING AFTER PURCHASE — payment verified; take the user straight to
// the start of the path (CUSTOMER).
export default function PurchaseSuccessOverlay({ businessName, onStart, onLater }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onLater()}>
      <DialogContent className="max-w-md border-primary/40 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gradient">YOUR BUSINESS IS UNLOCKED</DialogTitle>
          <DialogDescription className="text-sm font-semibold text-foreground">
            {businessName}
          </DialogDescription>
        </DialogHeader>
        <p className="text-xs leading-relaxed text-muted-foreground">
          HustleDrop is going to help you build this one step at a time.
        </p>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground">YOUR PATH</div>
          <div className="mt-2.5 space-y-1.5">
            {PATH_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-brand-gradient-soft font-mono text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="font-mono text-xs font-bold tracking-wider text-foreground/90">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01]"
        >
          START BUILDING
        </button>
        <p className="text-center text-[10px] text-muted-foreground">
          Start with CUSTOMER — everything else builds on it.
        </p>
      </DialogContent>
    </Dialog>
  );
}