import React from 'react';
import EmptyState from '@/components/EmptyState';
import { TrendingUp } from 'lucide-react';

export default function Grow() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">GROW</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Grow</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Continue improving after launch.
        </p>
      </div>

      <EmptyState
        icon={TrendingUp}
        title="Nothing to grow yet"
        description="Growth guidance will appear here once you have a launched business."
      />
    </div>
  );
}