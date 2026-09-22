import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

// Optional full-strategy drawer for a mission — the complete AI-generated
// module detail lives here, keeping the mission surface interactive and
// compact. The full output is never regenerated or altered by the drawer.
export default function StrategyDrawer({ open, onOpenChange, title, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] max-w-2xl gap-0 overflow-y-auto border-white/10 bg-card p-0 [&>button]:hidden">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-card/95 px-4 py-3 backdrop-blur">
          <DialogTitle className="font-mono text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
            {title}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-6">{children}</div>
      </DialogContent>
    </Dialog>
  );
}