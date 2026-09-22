import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronDown } from 'lucide-react';
import MatchHeroReveal from '@/components/results/alt/MatchHeroReveal';
import BestForStrip from '@/components/results/alt/BestForStrip';
import StatBars from '@/components/results/alt/StatBars';
import WhyYouMatched from '@/components/results/alt/WhyYouMatched';
import TheCatch from '@/components/results/alt/TheCatch';
import YourAdvantage from '@/components/results/alt/YourAdvantage';
import FirstQuest from '@/components/results/alt/FirstQuest';
import BusinessSnapshot from '@/components/results/BusinessSnapshot';

// ALTERNATE PATH REVEAL — full detail for a #2/#3 match, styled as discovering
// a playable path. Opens instantly with a subtle local reveal (no global
// analysis animation); data is already loaded. The primary #1 experience is
// untouched. Selection still goes through the same persistence flow.
export default function AltMatchDetailModal({ match, isCurrent = false, dna = null, busy = false, onClose, onSelect }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Dialog open={!!match} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88dvh] max-w-2xl gap-0 overflow-y-auto border-white/10 bg-card p-0 [&>button]:hidden">
        {match && (
          <>
            <DialogTitle className="sr-only">{match.model.name}</DialogTitle>
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-card/95 px-4 py-3 backdrop-blur">
              <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
                MATCH #{match.rank} · ALTERNATE PATH
              </span>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-muted-foreground transition hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <motion.div
              key={match.model.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="space-y-4 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6"
            >
              <MatchHeroReveal match={match} dna={dna} />
              <BestForStrip match={match} />
              <StatBars match={match} />
              <WhyYouMatched match={match} dna={dna} />
              <TheCatch match={match} />
              <YourAdvantage dna={dna} />
              <FirstQuest
                match={match}
                isCurrent={isCurrent}
                busy={busy}
                onSelect={(m) => {
                  onSelect(m);
                  onClose();
                }}
                onClose={onClose}
              />
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="flex w-full items-center justify-center gap-1.5 rounded-full border border-white/10 py-2.5 text-[10px] font-bold tracking-widest text-muted-foreground transition hover:text-foreground"
              >
                {showDetails ? 'HIDE FULL BUSINESS DETAILS' : 'VIEW FULL BUSINESS DETAILS'}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
              {showDetails && <BusinessSnapshot match={match} />}
            </motion.div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}