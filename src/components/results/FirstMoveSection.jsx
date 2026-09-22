import React from 'react';
import { Button } from '@/components/ui/button';

// YOUR FIRST MOVE — the model's first validation action. Favors validation
// before unnecessary spending.
export default function FirstMoveSection({ match, onSelect, selected, busy }) {
  const m = match.model;
  return (
    <section className="border-gradient rounded-2xl p-6 glow-primary">
      <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">YOUR FIRST MOVE</div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">
        {m.first_validation_action || 'Start with a small, low-cost test before spending on equipment.'}
      </p>
      {!selected && (
        <Button
          onClick={() => onSelect(match)}
          disabled={busy}
          className="mt-5 w-full rounded-full bg-brand-gradient py-5 text-sm font-semibold text-white hover:scale-[1.01]"
        >
          {busy ? 'SAVING…' : "I'D TRY THIS"}
        </Button>
      )}
    </section>
  );
}