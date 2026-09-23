import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Generic structured-content editor for generated modules. Editing an
// ACCEPTED version never overwrites it — the edit is saved as a new draft the
// user must explicitly accept. Editing a draft updates that draft only.
function FieldEditor({ value, onChange }) {
  if (typeof value === 'string') {
    const rows = Math.min(8, Math.max(2, value.split('\n').length));
    return (
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    );
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return (
      <input
        type="text"
        value={String(value)}
        onChange={(e) => {
          const n = Number(e.target.value);
          onChange(e.target.value !== '' && Number.isFinite(n) ? n : e.target.value);
        }}
        className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">
              <FieldEditor
                value={item}
                onChange={(v) => {
                  const next = [...value];
                  next[i] = v;
                  onChange(next);
                }}
              />
            </div>
            <button
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="mt-2 text-[11px] font-semibold text-muted-foreground transition hover:text-destructive"
            >
              REMOVE
            </button>
          </div>
        ))}
        <button
          onClick={() => onChange([...value, typeof value[0] === 'string' ? '' : {}])}
          className="text-[11px] font-bold tracking-wider text-primary"
        >
          + ADD ITEM
        </button>
      </div>
    );
  }
  if (value && typeof value === 'object') {
    return (
      <div className="space-y-3 rounded-lg border border-white/10 p-3">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <div className="mb-1 text-[10px] font-semibold tracking-wider text-muted-foreground">
              {k.replace(/_/g, ' ').toUpperCase()}
            </div>
            <FieldEditor value={v} onChange={(v2) => onChange({ ...value, [k]: v2 })} />
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function StructuredEditor({ open, title, content, onClose, onSave, autosave = false }) {
  const [draft, setDraft] = useState(null);
  const draftRef = useRef(null);
  const dirtyRef = useRef(false);
  const timerRef = useRef(null);
  const onSaveRef = useRef(onSave);
  const autosaveRef = useRef(autosave);
  onSaveRef.current = onSave;
  autosaveRef.current = autosave;

  // A content change only resets the local draft when there are no unsaved
  // local edits — never clobbers typing with the echo of a completed autosave.
  useEffect(() => {
    if (dirtyRef.current) return;
    setDraft(content ? JSON.parse(JSON.stringify(content)) : null);
  }, [content]);

  // AUTOSAVE (draft targets only): debounced in-place updates, never new
  // versions. Accepted targets keep the explicit SAVE — editing those forks a
  // new draft version by design and must not multiply per keystroke.
  const handleChange = (v) => {
    setDraft(v);
    draftRef.current = v;
    dirtyRef.current = true;
    if (!autosaveRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const snapshot = draftRef.current;
      Promise.resolve(onSaveRef.current(snapshot, { close: false }))
        .then(() => {
          // Landed — unless the user typed past this snapshot, allow resets again.
          if (draftRef.current === snapshot) dirtyRef.current = false;
        })
        .catch(() => {});
    }, 800);
  };

  // Leaving mid-edit (navigate/refresh) still saves the pending keystrokes.
  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        onSaveRef.current(draftRef.current, { close: false });
      }
    },
    []
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Edit this version directly. If it has already been accepted, your edits are saved as a new draft — the
            accepted version stays untouched until you press KEEP IT again.
          </DialogDescription>
        </DialogHeader>
        {draft !== null && (
          <div className="space-y-3">
            <FieldEditor value={draft} onChange={handleChange} />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} className="rounded-full text-xs font-semibold">
                CANCEL
              </Button>
              <Button
                onClick={() => {
                  dirtyRef.current = false;
                  onSave(draft);
                }}
                className="rounded-full bg-brand-gradient text-xs font-semibold text-white"
              >
                SAVE EDITS
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}