import React from 'react';
import { DIMENSIONS } from '@/lib/dnaDisplay';

// Six preference dimensions as visual scales. Position is a preference
// indicator, not a scientific measurement.
export default function DnaDimensionsPanel({ dimensions }) {
  return (
    <div className="space-y-4">
      {DIMENSIONS.map((dim) => {
        const value = dimensions?.[dim.key] ?? 50;
        return (
          <div key={dim.key}>
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
              <span className="text-muted-foreground">{dim.left}</span>
              <span className="text-foreground/90">{dim.label}</span>
              <span className="text-muted-foreground">{dim.right}</span>
            </div>
            <div className="relative h-2 w-full border border-white/15 bg-white/[0.03]">
              <div
                className="absolute top-1/2 h-4 w-1.5 -translate-y-1/2 bg-primary"
                style={{ left: `calc(${value}% - 3px)` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}