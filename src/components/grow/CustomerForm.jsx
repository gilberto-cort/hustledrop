import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CUSTOMER_SOURCE_OPTIONS, sourceLabel } from '@/lib/growService';

// LOG A CUSTOMER — a lightweight win record. Amounts and personal details
// are always optional; only what happened is stored.
export default function CustomerForm({ open, busy, onClose, onSubmit }) {
  const [displayName, setDisplayName] = useState('');
  const [channel, setChannel] = useState(CUSTOMER_SOURCE_OPTIONS[0]);
  const [offer, setOffer] = useState('');
  const [amount, setAmount] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [referralSource, setReferralSource] = useState('');
  const [notes, setNotes] = useState('');

  const submit = () => {
    if (busy) return;
    onSubmit({
      name_or_alias: displayName.trim() || 'New customer',
      channel,
      offer_name: offer.trim(),
      sale_amount: amount ? Number(amount) : null,
      repeat_customer: repeat,
      referral_source: referralSource.trim(),
      notes: notes.trim(),
    });
    setDisplayName('');
    setOffer('');
    setAmount('');
    setRepeat(false);
    setReferralSource('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[88vh] max-w-md overflow-y-auto border-white/10 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">LOG A CUSTOMER</DialogTitle>
          <DialogDescription className="text-[11px]">
            A real win you recorded outside the pipeline. Amounts are optional — never required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">NAME OR ALIAS (OPTIONAL)</label>
            <input
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. The cafe on 5th"
              className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">HOW THEY FOUND YOU</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground"
            >
              {CUSTOMER_SOURCE_OPTIONS.map((c) => (
                <option key={c} value={c} className="bg-card">
                  {sourceLabel(c)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">OFFER (OPTIONAL)</label>
              <input
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="What they bought"
                className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">AMOUNT (OPTIONAL)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                placeholder="0.00"
                className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          <label className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-xs text-foreground/90">This is a repeat purchase by an existing customer</span>
          </label>
          {channel === 'referral' && (
            <div>
              <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">REFERRED BY (OPTIONAL)</label>
              <input
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                placeholder="Who referred them (with their permission)"
                className="mt-1 w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          )}
          <div>
            <label className="text-[10px] font-semibold tracking-wider text-muted-foreground">NOTES (OPTIONAL)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="What helped close the sale…"
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
            disabled={busy}
            className="rounded-full bg-brand-gradient font-bold tracking-wider text-white hover:opacity-90"
          >
            {busy ? 'SAVING…' : 'RECORD WIN'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}