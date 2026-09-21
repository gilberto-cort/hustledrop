import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import EmptyState from '@/components/EmptyState';
import { GitCompareArrows } from 'lucide-react';

export default function AdminMatches() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [results, models] = await Promise.all([
          base44.entities.MatchResult.list('-created_date', 200),
          base44.entities.BusinessModel.list('name', 500),
        ]);
        const nameById = new Map((models || []).map((m) => [m.id, m.name]));
        const rows = results || [];
        const topCounts = {};
        for (const r of rows) {
          if (r.rank === 1) {
            const n = nameById.get(r.business_model_id) || r.business_model_id;
            topCounts[n] = (topCounts[n] || 0) + 1;
          }
        }
        const users = new Set(rows.map((r) => r.user_id)).size;
        setData({ rows, nameById, topCounts, users });
      } catch (e) {
        setData({ rows: [], nameById: new Map(), topCounts: {}, users: 0 });
      }
    })();
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (data.rows.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">ADMIN</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Matches</h1>
        </div>
        <EmptyState
          icon={GitCompareArrows}
          title="No match results yet"
          description="MatchResult distributions will appear here once users run HustleMatch. No data is fabricated."
        />
      </div>
    );
  }

  const distribution = Object.entries(data.topCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">ADMIN</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Matches</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Match results" value={data.rows.length} />
        <Stat label="Matched users" value={data.users} />
        <Stat label="#1 distinct models" value={distribution.length} />
        <Stat label="Result sets" value={new Set(data.rows.map((r) => r.result_set_id)).size} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">#1 MATCH DISTRIBUTION</div>
        {distribution.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No ranked results recorded yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {distribution.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="w-48 truncate text-xs text-foreground/90">{name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${(count / distribution[0][1]) * 100}%` }} />
                </div>
                <span className="w-6 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">RECENT RESULTS</div>
        <div className="mt-3 space-y-2">
          {data.rows.slice(0, 20).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 p-2.5 text-xs">
              <span className="truncate text-foreground/90">
                #{r.rank} · {data.nameById.get(r.business_model_id) || r.business_model_id}
              </span>
              <span className="shrink-0 text-muted-foreground">
                {r.personal_fit}% fit · conf {r.match_confidence} {r.tie_breaker_used ? `· tie: ${r.tie_breaker_used}` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}