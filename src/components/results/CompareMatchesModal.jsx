import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { levelLabel, speedLabel, startupRangeLabel, workModeLabel } from '@/lib/matchDisplay';

const ROWS = [
  ['Startup range', (m) => startupRangeLabel(m)],
  ['Work mode', (m) => workModeLabel(m)],
  ['Physical effort', (m) => levelLabel(m.physical_intensity)],
  ['Relative speed to market', (m) => speedLabel(m.speed_to_first_sale)],
  ['Sales intensity', (m) => levelLabel(m.sales_intensity)],
  ['Customer interaction', (m) => levelLabel(m.customer_interaction)],
  ['Automation potential', (m) => levelLabel(m.automation_potential)],
  ['Recurring revenue potential', (m) => levelLabel(m.recurring_revenue_potential)],
  ['Scalability', (m) => levelLabel(m.scalability)],
  ['Weekend compatible', (m) => (m.weekend_friendly ? 'Yes' : 'Limited')],
];

// COMPARE MY TOP 3 — clean side-by-side. No universal winner is declared;
// #1 is labeled STRONGEST OVERALL FIT (the deterministic highest score for
// this user's profile), never "best" or "most profitable".
export default function CompareMatchesModal({ open, onOpenChange, matches }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">COMPARE MY TOP 3</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Differences are relative to each other — there is no universally "better" business here.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground"></th>
                {matches.map((match) => (
                  <th key={match.model.id} className="py-2 pr-4 align-top text-xs font-semibold text-foreground">
                    #{match.rank} · {match.model.name}
                    <div className="text-[10px] font-medium text-muted-foreground">{match.fit}% Personal Fit</div>
                    {match.rank === 1 && (
                      <div className="mt-1 inline-block rounded-full bg-brand-gradient-soft px-2 py-0.5 text-[9px] font-bold tracking-wider text-foreground">
                        STRONGEST OVERALL FIT
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, fn]) => (
                <tr key={label} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 text-xs font-medium text-muted-foreground">{label}</td>
                  {matches.map((match) => (
                    <td key={match.model.id} className="py-2.5 pr-4 text-xs text-foreground/90">
                      {fn(match.model)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          "Strongest overall fit" means the highest deterministic Personal Fit score for your profile — not the
          "best," most profitable or most successful business.
        </p>
      </DialogContent>
    </Dialog>
  );
}