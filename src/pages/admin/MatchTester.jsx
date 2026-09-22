import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SINGLE_SELECTS, ARRAY_FIELDS, DEFAULT_TEST_PROFILE_FORM, buildTestProfile } from '@/lib/testProfileForm';



export default function MatchTester() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState(DEFAULT_TEST_PROFILE_FORM);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const run = async () => {
    setRunning(true);
    try {
      const profile = buildTestProfile(form);
      // Server-side engine, admin-only test mode — no records are saved
      const res = await base44.functions.invoke('matchEngine', { test_profile: profile });
      setResult(res.data);
    } finally {
      setRunning(false);
    }
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
          disabled={running}
          className="mt-5 rounded-full bg-brand-gradient text-xs font-semibold text-white"
        >
          {running ? 'RUNNING…' : 'RUN MATCH ENGINE'}
        </Button>
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