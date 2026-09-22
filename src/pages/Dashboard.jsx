import React from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import { Target, Briefcase, Rocket, Sparkles, ArrowRight } from 'lucide-react';
import DnaDashboardCard from '@/components/dna/DnaDashboardCard';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is your HustleDrop base. Your progress across each phase will live here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <DnaDashboardCard />
        <DashboardCard
          icon={Target}
          label="Current HustleMatch"
          title="No active match"
          description="Your latest matched business models will show here."
          cta={{ label: 'View MATCH', to: '/results' }}
        />
        <DashboardCard
          icon={Briefcase}
          label="Selected Business"
          title="Nothing selected yet"
          description="Pick a business from your matches to start building."
          cta={{ label: 'Go to BUILD', to: '/build' }}
        />
        <DashboardCard
          icon={Rocket}
          label="Launch Progress"
          title="No launch in progress"
          description="Launch tasks will appear once you start building."
          cta={{ label: 'Go to LAUNCH', to: '/launch' }}
        />
      </div>

      <div>
        <div className="mb-3 text-xs font-semibold tracking-[0.25em] text-muted-foreground">NEXT MOVE</div>
        <EmptyState
          icon={Sparkles}
          title="No suggested next move yet"
          description="Once you have a HustleDNA profile or a selected business, we'll recommend your next step here."
          action={
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              Start with HustleMatch
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    </div>
  );
}

function DashboardCard({ icon: Icon, label, title, description, cta }) {
  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">{label}</span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Link
        to={cta.to}
        className="mt-5 inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary transition hover:gap-2"
      >
        {cta.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}