import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { levelLabel, speedLabel, startupRangeLabel } from '@/lib/matchDisplay';

const ROWS = [
  ['Startup range', (m) => startupRangeLabel(m)],
  ['Physical effort', (m) => levelLabel(m.physical_intensity)],
  ['Relative speed to market', (m) => speedLabel(m.speed_to_first_sale)],
  ['Sales intensity', (m) => levelLabel(m.sales_intensity)],
  ['Customer interaction', (m) => levelLabel(m.customer_interaction)],
  ['Weekend compatible', (m) => (m.weekend_friendly ? 'Yes' : 'Limited')],
  ['Automation potential', (m) => levelLabel(m.automation_potential)],
  ['Recurring revenue potential', (m) => levelLabel(m.recurring_revenue_potential)],
  ['Scalability', (m) => levelLabel(m.scalability)],
];

export default function CompareMatchesModal({ open, onOpenChange, matches }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/10 bg-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Your top matches, side by side</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Differences are relative to each other — neither option is universally "better."
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-2 pr-4 text-xs font-semibold text-muted-foreground"></th>
                {matches.map((match) => (
                  <th key={match.model.id} className="py-2 pr-4 text-xs font-semibold text-foreground">
                    #{match.rank} · {match.model.name}
                    <div className="text-[10px] font-medium text-muted-foreground">{match.fit}% Personal Fit</div>
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
      </DialogContent>
    </Dialog>
  );
}