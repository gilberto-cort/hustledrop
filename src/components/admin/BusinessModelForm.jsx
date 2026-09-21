import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const NUM_FIELDS = [
  ['startup_min', 'Startup cost min ($)'],
  ['startup_max', 'Startup cost max ($)'],
  ['speed_to_first_sale', 'Speed to first sale (1–5)'],
  ['sales_intensity', 'Sales intensity (1–5)'],
  ['physical_intensity', 'Physical intensity (1–5)'],
  ['automation_potential', 'Automation potential (1–5)'],
  ['scalability', 'Scalability (1–5)'],
  ['beginner_friendly_score', 'Beginner-friendliness (1–5)'],
  ['online_score', 'Online score (1–5)'],
  ['local_score', 'Local score (1–5)'],
  ['customer_interaction', 'Customer interaction (1–5)'],
  ['technical_skill', 'Technical skill (1–5)'],
  ['creative_skill', 'Creative skill (1–5)'],
  ['organization_skill', 'Organization skill (1–5)'],
  ['minimum_hours_week', 'Minimum hours / week'],
  ['recurring_revenue_potential', 'Recurring revenue potential (1–5)'],
  ['regulatory_complexity', 'Regulatory complexity (1–5)'],
];

const BOOL_FIELDS = [
  ['weekend_friendly', 'Weekend friendly'],
  ['solo_friendly', 'Solo friendly'],
  ['camera_required', 'Camera required'],
  ['vehicle_required', 'Vehicle required'],
  ['low_cost_validation_pathway', 'Approved low-cost validation pathway'],
  ['active', 'Active'],
];

const ARRAY_FIELDS = [
  ['primary_skills', 'Primary skills (comma separated)'],
  ['secondary_skills', 'Secondary skills (comma separated)'],
  ['interest_tags', 'Interest tags (comma separated)'],
  ['required_assets', 'Required assets (comma separated)'],
  ['hard_requirements', 'Hard requirements (asset keys, comma separated)'],
  ['friction_reasons', 'Friction reasons (comma separated)'],
];

const FAMILIES = ['Digital Services', 'Creative', 'Knowledge', 'Content', 'Local Services', 'Home Services', 'Events', 'Rental', 'Products'];

function slugify(s) {
  return (s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

export default function BusinessModelForm({ initial, saving, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({
    name: initial.name || '',
    slug: initial.slug || '',
    family: initial.family || 'Digital Services',
    description: initial.description || '',
    income_model: initial.income_model || '',
    typical_offer_type: initial.typical_offer_type || '',
    first_validation_action: initial.first_validation_action || '',
    validation_status: initial.validation_status || 'GREEN',
    verification_warning: initial.verification_warning || '',
    verified_date: initial.verified_date || '',
    ...Object.fromEntries(NUM_FIELDS.map(([k]) => [k, initial[k] ?? ''])),
    ...Object.fromEntries(ARRAY_FIELDS.map(([k]) => [k, (initial[k] || []).join(', ')])),
    ...Object.fromEntries(BOOL_FIELDS.map(([k]) => [k, initial[k] ?? false])),
  }));

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const parseNum = (v) => (v === '' || v === null ? null : Number(v));
    const parseArr = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
    onSave({
      name: form.name,
      slug: form.slug || slugify(form.name),
      family: form.family,
      description: form.description,
      income_model: form.income_model,
      typical_offer_type: form.typical_offer_type,
      first_validation_action: form.first_validation_action,
      validation_status: form.validation_status,
      verification_warning: form.validation_status === 'YELLOW' ? (form.verification_warning ||
        'Requirements may vary by location. Verify applicable licensing, tax, insurance, zoning or other local requirements before launch.') : null,
      verified_date: form.verified_date || null,
      ...Object.fromEntries(NUM_FIELDS.map(([k]) => [k, parseNum(form[k])])),
      ...Object.fromEntries(ARRAY_FIELDS.map(([k]) => [k, parseArr(form[k])])),
      ...Object.fromEntries(BOOL_FIELDS.map(([k]) => [k, !!form[k]])),
      beginner_friendly: Number(form.beginner_friendly_score) >= 4,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Group title="Basics">
        <Field label="Name">
          <Input required value={form.name} onChange={(e) => set('name', e.target.value)} className="border-white/10 bg-white/[0.02]" />
        </Field>
        <Field label="Slug (auto if blank)">
          <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} className="border-white/10 bg-white/[0.02]" />
        </Field>
        <Field label="Family">
          <Select value={form.family} onValueChange={(v) => set('family', v)}>
            <SelectTrigger className="border-white/10 bg-white/[0.02]"><SelectValue /></SelectTrigger>
            <SelectContent className="border-white/10 bg-popover">
              {FAMILIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Description" full>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="border-white/10 bg-white/[0.02]" />
        </Field>
        <Field label="Income model">
          <Input value={form.income_model} onChange={(e) => set('income_model', e.target.value)} className="border-white/10 bg-white/[0.02]" />
        </Field>
        <Field label="Typical offer type">
          <Input value={form.typical_offer_type} onChange={(e) => set('typical_offer_type', e.target.value)} className="border-white/10 bg-white/[0.02]" />
        </Field>
      </Group>

      <Group title="Matching attributes (1–5 unless noted)">
        <div className="grid grid-cols-2 gap-3">
          {NUM_FIELDS.map(([k, label]) => (
            <Field key={k} label={label}>
              <Input type="number" min="0" value={form[k]} onChange={(e) => set(k, e.target.value)} className="border-white/10 bg-white/[0.02]" />
            </Field>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {BOOL_FIELDS.map(([k, label]) => (
            <div key={k} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <Switch checked={!!form[k]} onCheckedChange={(v) => set(k, v)} />
              <span className="text-xs font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </Group>

      <Group title="Skills, interests & requirements">
        {ARRAY_FIELDS.map(([k, label]) => (
          <Field key={k} label={label} full>
            <Input value={form[k]} onChange={(e) => set(k, e.target.value)} className="border-white/10 bg-white/[0.02]" />
          </Field>
        ))}
      </Group>

      <Group title="Validation">
        <Field label="Validation status">
          <Select value={form.validation_status} onValueChange={(v) => set('validation_status', v)}>
            <SelectTrigger className="border-white/10 bg-white/[0.02]"><SelectValue /></SelectTrigger>
            <SelectContent className="border-white/10 bg-popover">
              {['GREEN', 'YELLOW', 'RED'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Verified date">
          <Input type="date" value={form.verified_date ? String(form.verified_date).slice(0, 10) : ''} onChange={(e) => set('verified_date', e.target.value)} className="border-white/10 bg-white/[0.02]" />
        </Field>
        <Field label="Verification warning (used when YELLOW)" full>
          <Textarea value={form.verification_warning} onChange={(e) => set('verification_warning', e.target.value)} className="border-white/10 bg-white/[0.02]" />
        </Field>
        <Field label="First validation action" full>
          <Textarea value={form.first_validation_action} onChange={(e) => set('first_validation_action', e.target.value)} className="border-white/10 bg-white/[0.02]" />
        </Field>
      </Group>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-full text-xs font-semibold">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="rounded-full bg-brand-gradient text-xs font-semibold text-white">
          {saving ? 'Saving…' : 'Save model'}
        </Button>
      </div>
    </form>
  );
}

function Group({ title, children }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? '' : 'contents'}>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {children}
      </label>
    </div>
  );
}