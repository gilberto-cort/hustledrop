import React, { useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import AltMatchCard from '@/components/results/AltMatchCard';
import AltMatchDetailModal from '@/components/results/AltMatchDetailModal';

// OTHER STRONG MATCHES — #2 and #3. VIEW MATCH opens the full result for an
// alternate without deleting the original ranking.
export default function AltMatches({ matches, dna, selectedModelId, busy, onSelect }) {
  const [detail, setDetail] = useState(null);

  const openDetail = (match) => {
    trackEvent('alternate_match_viewed', { business_model_id: match.model.id, rank: match.rank });
    setDetail(match);
  };

  return (
    <section>
      <div className="mb-3 text-xs font-semibold tracking-[0.25em] text-muted-foreground">
        OTHER STRONG MATCHES
      </div>
      <div className="space-y-3">
        {matches.map((match) => (
          <AltMatchCard
            key={match.model.id}
            match={match}
            current={match.model.id === selectedModelId}
            onView={() => openDetail(match)}
          />
        ))}
      </div>
      <AltMatchDetailModal
        match={detail}
        isCurrent={!!detail && detail.model.id === selectedModelId}
        dna={dna}
        busy={busy}
        onClose={() => setDetail(null)}
        onSelect={onSelect}
      />
    </section>
  );
}