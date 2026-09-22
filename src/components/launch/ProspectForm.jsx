import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CHANNEL_OPTIONS } from '@/lib/launchService';

// LOG A PROSPECT — a lightweight form with only what's needed to act: a name
// or identifier, the channel, and an optional note. No unnecessary personal
// information.
export default function ProspectForm({ open, busy, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState(CHANNEL_OPTIONS[0]);
  const [notes, setNotes] = useState('');

  const submit = () => {
    if (!name.trim() || busy) return;
    onSubmit({ name_or_alias: name.trim(), channel, notes: notes.trim() });
    setName('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md border-white/10 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">LOG A PROSPECT</DialogTitle>
          <DialogDescription className="text-[11px]">
            Just enough to act — a name or alias, where to find them, and an optional note.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">
              NAME OR IDENTIFIER *
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g. Sarah from the neighborhood group"
              className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">
              WHERE / CHANNEL
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground"
            >
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c} value={c} className="bg-card">
                  {c.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">
              NOTE (OPTIONAL)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Why they fit your ideal customer…"
              className="mt-1 w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-full border-white/15">
            CANCEL
          </Button>
          <Button
            onClick={submit}
            disabled={busy || !name.trim()}
            className="rounded-full bg-brand-gradient font-bold tracking-wider text-white hover:opacity-90"
          >
            {busy ? 'SAVING…' : 'ADD PROSPECT'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}