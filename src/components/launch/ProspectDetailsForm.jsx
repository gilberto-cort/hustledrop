import React, { useState } from 'react';
import { CHANNEL_OPTIONS } from '@/lib/launchService';

// ADD DETAILS — optional enrichment of a quick-tapped contact. Never
// required, and never affects progress counts.
export default function ProspectDetailsForm({ prospect, busy, onSave }) {
  const [name, setName] = useState(prospect.name_or_alias || '');
  const [channel, setChannel] = useState(prospect.channel || 'other');
  const [notes, setNotes] = useState(prospect.notes || '');

  const save = () => {
    if (busy) return;
    onSave({
      name_or_alias: name.trim() || prospect.name_or_alias,
      channel,
      notes: notes.trim(),
    });
  };

  return (
    <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={120}
        placeholder="Who was it? (optional)"
        aria-label="Contact name"
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
      />
      <div className="flex gap-2">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          aria-label="Channel"
          className="min-w-0 flex-1 rounded-lg border border-input bg-transparent px-3 py-2 text-xs text-foreground"
        >
          {CHANNEL_OPTIONS.map((c) => (
            <option key={c} value={c} className="bg-card">
              {c.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <button
          onClick={save}
          disabled={busy}
          className="shrink-0 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-[10px] font-bold tracking-wider text-primary transition hover:bg-primary/20 disabled:opacity-40"
        >
          {busy ? 'SAVING…' : 'SAVE DETAILS'}
        </button>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        maxLength={400}
        placeholder="Anything worth remembering (optional)"
        aria-label="Notes"
        className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary/40"
      />
    </div>
  );
}