import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BUILD_MODULES } from '@/lib/builderService';

// Admin Business Builder test mode: run any module against a preset scenario
// context (or your own accepted choices JSON), inspect exactly what was sent
// and what came back. Nothing is saved. Also lists the admin's own builder
// versions (version + accepted state).
const SCENARIOS = [
  {
    id: 'gaming',
    label: 'Mobile Gaming Party Service',
    context: {
      business_name: 'Mobile Gaming Party Service',
      business_category: 'Events',
      business_description: 'Mobile gaming parties for kids birthdays and local events',
      income_model: 'Per-event party bookings',
      startup_budget: '501_1000',
      hours_available_weekly: '11_20',
      work_location_preference: 'local_in_person',
      sales_comfort: 3,
      customer_interaction_preference: 'high',
      physical_tolerance: 2,
      primary_priority: 'speed',
      skills: ['people', 'organization', 'gaming'],
      interests: ['gaming', 'events', 'children'],
      assets: ['vehicle', 'smartphone'],
      primary_dna: 'connector',
      secondary_dna: 'operator',
      hustle_code: 'CN-OP',
      match_positive_factors: ['budget_fit', 'weekend_fit', 'fast_launch_fit', 'existing_vehicle'],
      match_negative_factors: ['weekend_dependency', 'physical_setup'],
    },
  },
  {
    id: 'ai',
    label: 'AI Workflow Setup',
    context: {
      business_name: 'AI Workflow Setup Service',
      business_category: 'Digital Services',
      business_description: 'Setting up AI tools and simple automations for small businesses',
      income_model: 'Per-project setup fees',
      startup_budget: '0_50',
      hours_available_weekly: '5_10',
      work_location_preference: 'online',
      sales_comfort: 2,
      customer_interaction_preference: 'some',
      physical_tolerance: 1,
      primary_priority: 'automation',
      skills: ['technology', 'ai'],
      interests: ['technology', 'ai'],
      assets: ['computer'],
      primary_dna: 'digital_builder',
      secondary_dna: 'hustler',
      hustle_code: 'DB-HU',
      match_positive_factors: ['low_startup_cost', 'automation_fit', 'low_customer_interaction_fit'],
      match_negative_factors: ['sales_intensity'],
    },
  },
  {
    id: 'cleaning',
    label: 'Residential Cleaning',
    context: {
      business_name: 'Residential Cleaning Service',
      business_category: 'Home Services',
      business_description: 'Recurring and one-off home cleaning for busy households',
      income_model: 'Per-clean and recurring plans',
      startup_budget: '51_250',
      hours_available_weekly: '20_plus',
      work_location_preference: 'local_in_person',
      sales_comfort: 3,
      customer_interaction_preference: 'some',
      physical_tolerance: 4,
      primary_priority: 'speed',
      skills: ['organization'],
      interests: ['home'],
      assets: ['vehicle', 'tools'],
      primary_dna: 'builder',
      secondary_dna: 'operator',
      hustle_code: 'BU-OP',
      match_positive_factors: ['budget_fit', 'fast_launch_fit', 'existing_vehicle'],
      match_negative_factors: ['physical_setup', 'low_automation'],
    },
  },
];

export default function BuilderTester() {
  const [scenarioId, setScenarioId] = useState('gaming');
  const [moduleType, setModuleType] = useState('customer');
  const [choicesJson, setChoicesJson] = useState('{}');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [myAssets, setMyAssets] = useState([]);

  useEffect(() => {
    base44.entities.GeneratedAsset.list('-created_date', 100)
      .then((rows) => setMyAssets(rows || []))
      .catch(() => setMyAssets([]));
  }, []);

  const run = async () => {
    setBusy(true);
    setResult(null);
    let choices = {};
    try {
      choices = JSON.parse(choicesJson || '{}');
    } catch (e) {
      setResult({ status: 'invalid_choices_json', error: 'Accepted-choices JSON is invalid.' });
      setBusy(false);
      return;
    }
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    const context = { ...scenario.context, previously_approved_builder_choices: choices };
    try {
      const res = await base44.functions.invoke('builderGenerate', {
        test_mode: true,
        module_type: moduleType,
        context,
        options: {},
      });
      setResult({
        status: res.data ? res.data.status : 'error',
        error: res.data ? res.data.error : 'no response',
        context,
        content: res.data ? res.data.content : null,
      });
    } catch (e) {
      setResult({ status: 'error', error: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Business Builder Tester</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Generate any module against a preset scenario. Nothing is saved. Inspect the exact context sent, the
          generated module, errors, and your own builder versions below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">SCENARIO</span>
          <select
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground"
          >
            {SCENARIOS.map((s) => (
              <option key={s.id} value={s.id} className="bg-card">
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">MODULE</span>
          <select
            value={moduleType}
            onChange={(e) => setModuleType(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground"
          >
            {[...BUILD_MODULES, { key: 'launch', num: '07', label: 'LAUNCH (legacy plan)' }].map((m) => (
              <option key={m.key} value={m.key} className="bg-card">
                {m.num} {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground">
          ACCEPTED UPSTREAM CHOICES (JSON — required for dependent modules)
        </span>
        <textarea
          value={choicesJson}
          onChange={(e) => setChoicesJson(e.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs text-foreground"
        />
      </label>

      <button
        onClick={run}
        disabled={busy}
        className="rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        {busy ? 'GENERATING…' : 'RUN TEST'}
      </button>

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">STATUS</span>
            <p className={`mt-1 font-mono text-sm ${result.status === 'ok' ? 'text-primary' : 'text-destructive'}`}>
              {result.status}
              {result.error ? ` — ${result.error}` : ''}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">CONTEXT SENT</span>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] text-foreground/80">
              {JSON.stringify(result.context, null, 2)}
            </pre>
          </div>
          {result.content && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground">GENERATED MODULE</span>
              <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] text-foreground/80">
                {JSON.stringify(result.content, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <span className="text-xs font-semibold tracking-wider text-muted-foreground">
          MY BUILDER VERSIONS (version + accepted state)
        </span>
        {myAssets.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No builder assets yet.</p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="py-1.5 pr-3">module</th>
                  <th className="py-1.5 pr-3">version</th>
                  <th className="py-1.5 pr-3">status</th>
                  <th className="py-1.5 pr-3">created</th>
                </tr>
              </thead>
              <tbody>
                {myAssets.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 text-foreground/80">
                    <td className="py-1.5 pr-3">{a.module_type}</td>
                    <td className="py-1.5 pr-3">{a.version}</td>
                    <td className="py-1.5 pr-3">{a.status}</td>
                    <td className="py-1.5 pr-3">{new Date(a.created_date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}