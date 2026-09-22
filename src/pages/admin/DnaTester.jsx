import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SINGLE_SELECTS, ARRAY_FIELDS, DEFAULT_TEST_PROFILE_FORM, buildTestProfile } from '@/lib/testProfileForm';
import { DNA_TYPES, STRENGTHS, TRAPS, TYPE_ORDER } from '@/lib/dnaDisplay';
import DnaScoresPanel from '@/components/dna/DnaScoresPanel';
import DnaDimensionsPanel from '@/components/dna/DnaDimensionsPanel';

export default function DnaTester() {
  const [running, setRunning] = useState(false);
  const [dna, setDna] = useState(null);
  const [form, setForm] = useState(DEFAULT_TEST_PROFILE_FORM);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const run = async () => {
    setRunning(true);
    try {
      // Server-side deterministic engine, admin-only test mode — nothing is saved
      const res = await base44.functions.invoke('hustleDna', { test_profile: buildTestProfile(form) });
      setDna(res.data?.dna || null);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">ADMIN · HUSTLEDNA TESTER</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Test the DNA engine</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Build a temporary profile and inspect the deterministic archetype scores, dimensions, strengths, traps and the exact input signals behind each result. Nothing here changes your real profile.
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
          disabled={running}
          className="mt-5 rounded-full bg-brand-gradient text-xs font-semibold text-white"
        >
          {running ? 'RUNNING…' : 'RUN DNA ENGINE'}
        </Button>
      </div>

      {dna && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">TYPES &amp; HUSTLE CODE</div>
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs">
              <span className="text-muted-foreground">PRIMARY</span>
              <span className={`font-bold ${DNA_TYPES[dna.primary_type].accent}`}>{DNA_TYPES[dna.primary_type].label}</span>
              <span className="text-muted-foreground">SECONDARY</span>
              <span className={DNA_TYPES[dna.secondary_type].accent}>{DNA_TYPES[dna.secondary_type].label}</span>
              <span className="text-muted-foreground">SUPPORTING</span>
              <span className={DNA_TYPES[dna.supporting_type].accent}>{DNA_TYPES[dna.supporting_type].label}</span>
              <span className="rounded border border-white/20 bg-white/5 px-2 py-0.5 font-bold tracking-widest">{dna.hustle_code}</span>
            </div>
            <div className="mt-4">
              <DnaScoresPanel scores={dna.scores} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">SIX DIMENSIONS</div>
            <div className="mt-4">
              <DnaDimensionsPanel dimensions={dna.dimensions} />
            </div>
            <div className="mt-4 space-y-1.5">
              {dna.dimension_details.map((d) => (
                <div key={d.key} className="flex flex-wrap justify-between gap-2 rounded-lg border border-white/5 p-2 text-[11px]">
                  <span className="text-foreground/80">{d.key}: {d.value}</span>
                  <span className="text-muted-foreground">{d.factors.join(' · ') || 'base only'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">DERIVED STRENGTHS &amp; TRAPS</div>
            <div className="mt-3 text-xs">
              <div className="text-foreground/90">{(dna.strengths || []).map((t) => STRENGTHS[t] || t).join(', ')}</div>
              <div className="mt-1 text-muted-foreground">watch for: {(dna.traps || []).map((t) => TRAPS[t] || t).join(', ')}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">SIGNAL CONTRIBUTIONS (EXPLAINABILITY)</div>
            <div className="mt-3 space-y-2">
              {TYPE_ORDER.map((type) => (
                <details key={type} className="rounded-lg border border-white/10 p-3">
                  <summary className="cursor-pointer font-mono text-xs font-medium text-foreground">
                    {DNA_TYPES[type].code} · {DNA_TYPES[type].label} — {dna.scores[type]}
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    {dna.contributions[type].map((c) => (
                      <span key={c.key} className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-muted-foreground">
                        {c.key} +{c.points}
                      </span>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}