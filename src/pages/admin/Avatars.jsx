import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DNA_TYPES } from '@/lib/dnaDisplay';

// Avatar sprite assignment. Each row is a clearly-labelled asset slot
// (e.g. DB-M, DB-F) waiting for the approved HustleDrop pixel artwork.
// Admins paste the uploaded sprite URL here — nothing about matching changes.
export default function Avatars() {
  const [avatars, setAvatars] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    const rows = await base44.entities.Avatar.list('display_name', 100);
    setAvatars(rows || []);
    const next = {};
    (rows || []).forEach((a) => { next[a.id] = a.sprite_asset || ''; });
    setDrafts(next);
  };

  useEffect(() => { load(); }, []);

  const save = async (a) => {
    setSavingId(a.id);
    try {
      await base44.entities.Avatar.update(a.id, { sprite_asset: drafts[a.id] || '' });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  if (avatars === null) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">ADMIN · AVATARS</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Character sprites</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Assign the approved HustleDrop sprite artwork to each slot. Avatars are cosmetic only — they never affect scoring, matching, eligibility or pricing.
        </p>
      </div>

      <div className="space-y-2">
        {avatars.map((a) => {
          const meta = DNA_TYPES[a.dna_type] || {};
          const slot = `${meta.code || a.dna_type}-${a.presentation === 'feminine' ? 'F' : 'M'}`;
          return (
            <div key={a.id} className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest">{slot}</span>
                  <span className="text-sm font-semibold text-foreground">{a.display_name}</span>
                </div>
                <Label className="mt-2 text-[10px] text-muted-foreground">Sprite asset URL (leave empty for placeholder)</Label>
                <Input
                  value={drafts[a.id] || ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                  className="mt-1 border-white/10 bg-white/[0.02] text-xs"
                />
              </div>
              <Button onClick={() => save(a)} disabled={savingId === a.id} className="rounded-full text-xs">
                {savingId === a.id ? 'SAVING…' : 'SAVE'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}