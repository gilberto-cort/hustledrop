import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import BusinessSnapshot from '@/components/results/BusinessSnapshot';
import WhyThisFitsSection from '@/components/results/WhyThisFitsSection';
import TradeoffSection from '@/components/results/TradeoffSection';
import FirstMoveSection from '@/components/results/FirstMoveSection';

// Full result view for an alternate match. Read-only — the original ranking
// stays intact; selecting here simply records the user's choice.
export default function AltMatchDetailModal({ match, onClose, onSelect }) {
  return (
    <Dialog open={!!match} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-card sm:max-w-2xl">
        {match && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                MATCH #{match.rank} · {match.model.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {match.fit}% Personal Fit — compatibility with your stated circumstances, not a success prediction.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <BusinessSnapshot match={match} />
              <WhyThisFitsSection match={match} />
              <TradeoffSection match={match} />
              <FirstMoveSection
                match={match}
                onSelect={(m) => {
                  onSelect(m);
                  onClose();
                }}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}