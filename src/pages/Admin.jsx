import React from 'react';
import EmptyState from '@/components/EmptyState';
import { Boxes } from 'lucide-react';

export default function Admin() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">ADMIN</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Business Models</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Manage the catalog of business models used for matching.
        </p>
      </div>

      <EmptyState
        icon={Boxes}
        title="No business models yet"
        description="The business model catalog is empty. Add models here to power HustleMatch. No data is fabricated."
      />
    </div>
  );
}