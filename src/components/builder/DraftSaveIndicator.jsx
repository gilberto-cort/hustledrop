import React from 'react';
import { Check, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';

// SAVING / SAVED / SAVE FAILED status for the builder's autosaved answers.
// On failure nothing is lost — unsaved changes stay local and RETRY re-sends
// the latest state.
export default function DraftSaveIndicator({ state, onRetry }) {
  if (state === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        SAVING…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-emerald-400/80">
        <Check className="h-3 w-3" />
        SAVED
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[9px] font-bold tracking-widest text-amber-400">
        <AlertTriangle className="h-3 w-3" />
        SAVE FAILED — YOUR ANSWERS ARE KEPT
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 px-2 py-0.5 text-amber-300 transition hover:bg-amber-400/10"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          RETRY
        </button>
      </span>
    );
  }
  return null;
}