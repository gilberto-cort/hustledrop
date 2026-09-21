import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { computeMatches } from '@/lib/matchingEngine';

const SINGLE_SELECTS = [
  ['startup_budget', 'Startup budget', [['0_50', '$0–$50'], ['51_250', '$51–$250'], ['251_500', '$251–$500'], ['501_1000', '$501–$1,000'], ['1001_plus', '$1,001+']]],
  ['speed_preference', 'Speed preference', [['asap', 'ASAP'], ['1_2_weeks', '1–2 weeks'], ['within_30_days', '30 days'], ['longer_build', 'Longer build']]],
  ['weekly_hours', 'Weekly hours', [['lt_5', '<5'], ['5_10', '5–10'], ['11_20', '11–20'], ['20_plus', '20+']]],
  ['work_location_preference', 'Work location', [['online', 'Online'], ['local_in_person', 'Local'], ['either', 'Either']]],
  ['sales_comfort', 'Sales comfort (1–4)', [['1', '1 — dislikes'], ['2', '2 — little'], ['3', '3 — comfortable'], ['4', '4 — enjoys']]],
  ['customer_interaction_preference', 'Customer interaction', [['minimal', 'Minimal'], ['some', 'Some'], ['indifferent', "Don't care"], ['high', 'High']]],
  ['business_model_preference', 'Business preference', [['service', 'Service'], ['digital', 'Digital'], ['product', 'Product'], ['rental', 'Rental'], ['content', 'Content'], ['no_preference', 'No preference']]],
  ['physical_work_tolerance', 'Physical tolerance (1–4)', [['1', '1 — none'], ['2', '2 — light'], ['3', '3 — moderate'], ['4', '4 — heavy']]],
  ['income_goal', 'Income goal', [['under_500', '<$500'], ['500_1000', '$500–$1k'], ['1000_2500', '$1k–$2.5k'], ['2500_5000', '$2.5k–$5k'], ['5000_plus', '$5k+']]],
  ['primary_priority', 'Primary priority', [['speed', 'Fastest revenue'], ['cost', 'Lowest cost'], ['flexibility', 'Flexibility'], ['automation', 'Automation'], ['scale', 'Long-term scale'], ['enjoyment', 'Enjoyment']]],
];

const ARRAY_FIELDS = [
  ['skills', 'Skills (comma separated: people, sales, writing, design, video, photography, technology, ai, organization, teaching, fitness, cooking, beauty, repairs, automotive, cleaning, landscaping, events, gaming, social_media)'],
  ['interests', 'Interests (comma separated: gaming, technology, ai, automotive, pets, fitness, beauty, fashion, food, home, outdoors, education, business, events, children, media, art, music, social_media, ecommerce)'],
  ['assets', 'Assets (comma separated: vehicle, computer, smartphone, tools, workspace, audience_following, camera, specialized_equipment)'],
];

export default function MatchTester() {
  const [models, setModels] = useState(null);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    startup_budget: '0_50',
    speed_preference: 'within_30_days',
    weekly_hours: '5_10',
    work_location_preference: 'either',
    sales_comfort: '3',
    customer_interaction_preference: 'some',
    business_model_preference: 'no_preference',
    physical_work_tolerance: '3',
    income_goal: '1000_2500',
    primary_priority: 'speed',
    skills: 'technology, ai',
    interests: '',
    assets: 'computer, smartphone',
  });

  useEffect(() => {
    base44.entities.BusinessModel.list('name', 500).then((rows) => setModels(rows || []));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const run = () => {
    const parseArr = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
    const profile = {
      ...form,
      sales_comfort: Number(form.sales_comfort),
      physical_work_tolerance: Number(form.physical_work_tolerance),
      skills: parseArr(form.skills),
      interests: parseArr(form.interests),
      assets: parseArr(form.assets),
    };
    setResult(computeMatches(profile, models));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">ADMIN · MATCH ENGINE TESTER</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Test the engine</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Build a temporary test profile and run the deterministic engine. Nothing here changes your real HustleProfile or stored results.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SINGLE_SELECTS.map(([key, label, options]) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-[10px] font-medium text-muted-foreground">{label}</Label>
              <Select value={form[key]} onValueChange={(v) => set(key, v)}>
                <SelectTrigger className="border-white/10 bg-white/[0.02] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="border-white/10 bg-popover">
                  {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3">
          {ARRAY_FIELDS.map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label className="text-[10px] font-medium text-muted-foreground">{label}</Label>
              <Input value={form[key]} onChange={(e) => set(key, e.target.value)} className="border-white/10 bg-white/[0.02] text-xs" />
            </div>
          ))}
        </div>
        <Button
          onClick={run}
          disabled={!models || models.length === 0}
          className="mt-5 rounded-full bg-brand-gradient text-xs font-semibold text-white"
        >
          RUN MATCH ENGINE
        </Button>
        {models && models.length === 0 && (
          <p className="mt-3 text-xs text-destructive">No business models found — seed the catalog first.</p>
        )}
      </div>

      {result && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">MATCH CONFIDENCE</div>
            <p className="mt-2 text-sm text-foreground">
              {result.confidence.score} → <span className="font-semibold">{result.confidence.category}</span>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {result.eligible.length} eligible · {result.filtered.length} filtered
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">ELIGIBLE (RANKED)</div>
            <div className="mt-3 space-y-2">
              {result.eligible.map((s) => (
                <details key={s.model.id} className="rounded-lg border border-white/10 p-3">
                  <summary className="cursor-pointer text-xs font-medium text-foreground">
                    #{s.rank} · {s.model.name} — {Math.round(s.fit)} fit
                    <span className="ml-2 text-muted-foreground">(base {s.baseScore})</span>
                  </summary>
                  <div className="mt-3 space-y-2 text-[11px] text-muted-foreground">
                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                      {Object.entries(s.factors).map(([k, v]) => (
                        <span key={k}>{k}: {v.toFixed(2)}</span>
                      ))}
                    </div>
                    {s.bonuses.length > 0 && (
                      <div>bonuses: {s.bonuses.map((b) => `${b.key} +${b.points}`).join(', ')}</div>
                    )}
                    {s.penalties.length > 0 && (
                      <div>penalties: {s.penalties.map((p) => `${p.key} -${p.points}`).join(', ')}</div>
                    )}
                    <div>positives: {s.positives.join(', ') || '—'}</div>
                    <div>negatives: {s.negatives.join(', ') || '—'}</div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">FILTERED (HARD-ELIGIBILITY)</div>
            <div className="mt-3 space-y-1.5 text-xs">
              {result.filtered.map((f) => (
                <div key={f.model.id} className="flex justify-between gap-3 rounded-lg border border-white/5 p-2">
                  <span className="text-foreground/90">{f.model.name}</span>
                  <span className="text-destructive">{f.reasons.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}