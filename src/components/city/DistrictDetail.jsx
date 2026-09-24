import React from 'react';
import { Check, Lock, Clock, ArrowRight } from 'lucide-react';

// ============================================================
// DISTRICT DETAIL — the panel that opens when a district is selected
// on the city map. Purpose, opportunities, challenges and the user's
// REAL progress (passed in by the City page from existing records).
//
// RULES:
//  - Every action points at an EXISTING app page — nothing new is
//    invented and no parallel progression is created.
//  - Interactions with no implemented destination are labelled
//    COMING SOON — never a broken button.
//  - A locked district is still viewable: its actions are shown with
//    the milestone that opens them, but stay non-interactive.
// ============================================================

// Static copy — descriptive only. Paths go to existing pages.
const DISTRICT_CONTENT = {
  crossroads: {
    purpose:
      'Where every journey starts: find out who you are as a builder, see the businesses that fit your real circumstances, and commit to one.',
    opportunities: [
      { label: 'HUSTLEMATCH QUIZ', description: 'The 13 questions behind your DNA and matches', path: '/discover' },
      { label: 'YOUR HUSTLEDNA', description: 'Your work-style profile and character', path: '/hustledna' },
      { label: 'YOUR MATCHES', description: 'Your top-matching businesses', path: '/results' },
    ],
    challenges: [],
  },
  opportunity_alley: {
    purpose:
      'Forge the offer: run the six Build missions to turn your chosen business into something you can actually sell.',
    opportunities: [{ label: 'BUSINESS BUILDER', description: 'Your six build missions', path: '/build' }],
    challenges: [{ label: 'SIX-MISSION LOCK-IN', description: 'Generate and accept all six modules', path: '/build' }],
  },
  founders_row: {
    purpose:
      'Take what you built to real people: prospect, make contact, follow up and earn your first paying customer.',
    opportunities: [{ label: 'LAUNCH MODE', description: 'Your first-customer quest map', path: '/launch' }],
    challenges: [
      { label: 'FIRST-CUSTOMER QUEST', description: 'Complete the launch mission ladder', path: '/launch' },
      { label: 'DAILY QUESTS', description: 'One meaningful real action a day keeps the streak alive', path: '/launch' },
    ],
  },
  neon_district: {
    purpose:
      'The road to five: turn one customer into momentum with reviews, referrals, repeat wins and an operating loop.',
    opportunities: [{ label: 'GROW MODE', description: 'Your customer-growth missions', path: '/grow' }],
    challenges: [
      { label: 'ROAD TO 5 CUSTOMERS', description: 'Record five real customer wins', path: '/grow' },
      { label: 'REVIEW + REFERRAL MISSIONS', description: 'Turn happy customers into new ones', path: '/grow' },
    ],
  },
  skyline_heights: {
    purpose: 'Above the neon — the next chapter of the journey. The lights are on, but the doors are not open yet.',
    opportunities: [{ label: 'NEW HEIGHTS', description: 'The next phase of HustleDrop', comingSoon: true }],
    challenges: [],
  },
};

function SectionTitle({ children }) {
  return <div className="font-mono text-[9px] font-bold tracking-widest text-muted-foreground">{children}</div>;
}

function ActionRow({ item, locked, unlockHint, onNavigate }) {
  if (item.comingSoon) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 opacity-75">
        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground">{item.label}</div>
          <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{item.description}</div>
        </div>
        <span className="ml-auto shrink-0 rounded-full border border-white/15 px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest text-muted-foreground">
          COMING SOON
        </span>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 opacity-60">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="font-mono text-[11px] font-bold tracking-wider text-muted-foreground">{item.label}</div>
          <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {item.description} — opens at: {unlockHint}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onNavigate(item.path)}
      className="flex w-full items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-primary/50 hover:bg-brand-gradient-soft focus-visible:ring-2 focus-visible:ring-ring outline-none"
    >
      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block font-mono text-[11px] font-bold tracking-wider text-foreground">{item.label}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{item.description}</span>
      </span>
    </button>
  );
}

function ProgressFacts({ districtKey, progress }) {
  const facts = [];
  if (districtKey === 'crossroads') {
    facts.push(['HustleDNA revealed', !!progress.hasDna]);
    facts.push(['Business selected', !!progress.hasSelection]);
  } else if (districtKey === 'opportunity_alley') {
    facts.push([`Build missions accepted: ${progress.acceptedCount}/${progress.totalModules}`, progress.acceptedCount >= progress.totalModules]);
  } else if (districtKey === 'founders_row') {
    facts.push(['First customer recorded', !!progress.hasFirstCustomer]);
    facts.push([`Daily streak: ${progress.streak || 0} day${progress.streak === 1 ? '' : 's'}`, (progress.streak || 0) > 0]);
  } else if (districtKey === 'neon_district') {
    facts.push([`Customers recorded: ${progress.customers}/5`, progress.customers >= 5]);
    facts.push(['Operating loop complete', !!progress.systemDone]);
  }
  if (facts.length === 0) return null;

  return (
    <div>
      <SectionTitle>YOUR PROGRESS</SectionTitle>
      <ul className="mt-1.5 space-y-1.5">
        {facts.map(([label, done]) => (
          <li key={label} className="flex items-center gap-2 text-xs text-foreground/90">
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                done ? 'bg-brand-gradient text-white' : 'border border-white/20 text-muted-foreground'
              }`}
            >
              {done ? <Check className="h-2.5 w-2.5" /> : <span className="h-1 w-1 rounded-full bg-muted-foreground" />}
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DistrictDetail({ district, state, progress = {}, onNavigate }) {
  const content = DISTRICT_CONTENT[district.key] || { purpose: '', opportunities: [], challenges: [] };
  const locked = state === 'locked';
  const stateBadge =
    state === 'completed' ? 'COMPLETE' : state === 'available' ? 'AVAILABLE' : 'LOCKED';

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-mono text-sm font-bold tracking-widest text-foreground">{district.name}</h3>
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest ${
              state === 'completed'
                ? 'border-primary/40 bg-primary/10 text-primary'
                : state === 'available'
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-white/15 text-muted-foreground'
            }`}
          >
            {stateBadge}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-foreground/90">{content.purpose}</p>
      </div>

      <div>
        <SectionTitle>MILESTONE</SectionTitle>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {district.tagline} — {district.milestone.toLowerCase()}.
        </p>
      </div>

      <ProgressFacts districtKey={district.key} progress={progress} />

      {content.opportunities.length > 0 && (
        <div>
          <SectionTitle>OPPORTUNITIES</SectionTitle>
          <div className="mt-1.5 space-y-2">
            {content.opportunities.map((o) => (
              <ActionRow key={o.label} item={o} locked={locked} unlockHint={district.milestone} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}

      {content.challenges.length > 0 && (
        <div>
          <SectionTitle>CHALLENGES</SectionTitle>
          <div className="mt-1.5 space-y-2">
            {content.challenges.map((c) => (
              <ActionRow key={c.label} item={c} locked={locked} unlockHint={district.milestone} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}