import React from 'react';
import { missionRecommendations } from '@/lib/launchService';

// Collapsed HOW-TO — the mission goal, why it matters, and recommendations
// built from the user's accepted Build modules + HustleDNA. Never blocks the
// primary action above it.
export default function MissionGuidance({ def, accepted, dna }) {
  const recs = missionRecommendations(accepted, dna);
  return (
    <div className="space-y-3">
      <p className="text-xs leading-relaxed text-foreground/90">{def.mission}</p>
      <div>
        <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">WHY THIS MATTERS</div>
        <p className="mt-1 text-xs leading-relaxed text-foreground/80">{def.why}</p>
      </div>
      {recs.length > 0 && (
        <div>
          <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">HUSTLEDROP SUGGESTS</div>
          <ul className="mt-1.5 space-y-1.5">
            {recs.map((r, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}