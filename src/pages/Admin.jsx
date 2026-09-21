import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import BusinessModelForm from '@/components/admin/BusinessModelForm';
import { Boxes, Plus, Pencil } from 'lucide-react';

export default function Admin() {
  const [models, setModels] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const rows = await base44.entities.BusinessModel.list('name', 500);
    setModels(rows || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleActive = async (m) => {
    await base44.entities.BusinessModel.update(m.id, { active: !m.active });
    load();
  };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editing.id) {
        await base44.entities.BusinessModel.update(editing.id, payload);
      } else {
        await base44.entities.BusinessModel.create(payload);
      }
      setEditing(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">ADMIN</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Business Models</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Manage the catalog the HustleMatch engine reads. New models work immediately — no code changes required.
          </p>
        </div>
        <Button onClick={() => setEditing({})} className="shrink-0 rounded-full bg-brand-gradient text-xs font-semibold text-white">
          <Plus className="mr-1 h-4 w-4" /> New model
        </Button>
      </div>

      {models === null ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
        </div>
      ) : models.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <Boxes className="mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No business models yet. Create the first one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {models.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{m.name}</span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{m.family}</span>
                  {m.validation_status === 'YELLOW' && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">⚠ verify locally</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  ${m.startup_min}–${m.startup_max} · speed {m.speed_to_first_sale}/5 · sales {m.sales_intensity}/5 · physical {m.physical_intensity}/5
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Switch checked={!!m.active} onCheckedChange={() => handleToggleActive(m)} />
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setEditing(m)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editing?.id ? 'Edit business model' : 'New business model'}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <BusinessModelForm initial={editing} saving={saving} onSave={handleSave} onCancel={() => setEditing(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}