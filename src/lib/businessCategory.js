// RPG-style business category identity + deterministic stat-bar helpers.
// Pure display metadata mapped from BusinessModel.family and its 1–5
// attributes — no scoring, no AI, no claims about results.
import {
  Cpu, Sparkles, BookOpen, Video, Store, Wrench, Ticket, KeyRound, Package,
  Compass, Zap, Users, Layers,
} from 'lucide-react';

// Category emblems — RPG class icons per business family, in the
// HustleDrop accent system. Never affects matching or scoring.
const CATEGORY_BY_FAMILY = {
  'Digital Services': { code: 'DIGITAL', Icon: Cpu, chip: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
  Creative: { code: 'CREATIVE', Icon: Sparkles, chip: 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300' },
  Knowledge: { code: 'KNOWLEDGE', Icon: BookOpen, chip: 'border-violet-500/40 bg-violet-500/10 text-violet-300' },
  Content: { code: 'CONTENT', Icon: Video, chip: 'border-pink-500/40 bg-pink-500/10 text-pink-300' },
  'Local Services': { code: 'LOCAL', Icon: Store, chip: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
  'Home Services': { code: 'HOME', Icon: Wrench, chip: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
  Events: { code: 'EVENT', Icon: Ticket, chip: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' },
  Rental: { code: 'RENTAL', Icon: KeyRound, chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  Products: { code: 'PRODUCT', Icon: Package, chip: 'border-sky-500/40 bg-sky-500/10 text-sky-300' },
};

const FALLBACK_CATEGORY = { code: 'PATH', Icon: Compass, chip: 'border-white/15 bg-white/5 text-foreground/80' };

export function categoryFor(family) {
  return CATEGORY_BY_FAMILY[family] || FALLBACK_CATEGORY;
}

// Stat bar: the model's 1–5 attribute becomes 0–10 filled segments.
export function statBarSegments(v) {
  return Math.max(0, Math.min(10, (Number(v) || 0) * 2));
}

// Segment fills follow the brand gradient: purple → pink → orange.
export const SEGMENT_FILLS = [
  'bg-purple-500', 'bg-purple-500', 'bg-purple-400',
  'bg-fuchsia-500', 'bg-fuchsia-500',
  'bg-pink-500', 'bg-pink-500', 'bg-pink-400',
  'bg-orange-500', 'bg-orange-500',
];

// Work-mode trait chips — derived directly from model attributes.
export function workTraits(m) {
  const on = Number(m.online_score) || 1;
  const lo = Number(m.local_score) || 1;
  const t = [];
  if (on >= 4 && lo <= 2) t.push('ONLINE');
  else if (lo >= 4 && on <= 2) t.push('LOCAL');
  else t.push('ONLINE + LOCAL');
  if (m.weekend_friendly) t.push('WEEKEND FRIENDLY');
  if ((Number(m.physical_intensity) || 3) <= 2) t.push('LOW PHYSICAL WORK');
  return t.slice(0, 3);
}

// BEST FOR strip — traits this model genuinely rewards, from real attributes.
export function bestFor(m) {
  const out = [];
  if ((Number(m.speed_to_first_sale) || 0) >= 4) out.push({ Icon: Zap, label: 'FAST STARTERS' });
  if ((Number(m.sales_intensity) || 0) >= 4 || (Number(m.customer_interaction) || 0) >= 4) {
    out.push({ Icon: Users, label: 'STRONG COMMUNICATORS' });
  }
  if ((Number(m.automation_potential) || 0) >= 4) out.push({ Icon: Layers, label: 'LEVERAGE BUILDERS' });
  if ((Number(m.startup_max) || 0) <= 300) out.push({ Icon: Compass, label: 'LOW-OVERHEAD BUILDERS' });
  return out.slice(0, 3);
}