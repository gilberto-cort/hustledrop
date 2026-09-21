import React from 'react';
import EmptyState from '@/components/EmptyState';
import { Rocket } from 'lucide-react';

export default function Launch() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">LAUNCH</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Launch</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Follow concrete steps toward your first customer.
        </p>
      </div>

      <EmptyState
        icon={Rocket}
        title="No launch plan yet"
        description="Once you start building a business, your launch checklist will appear here."
      />
    </div>
  );
}