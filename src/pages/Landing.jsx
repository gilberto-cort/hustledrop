import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import { ArrowRight, Compass, Target, Hammer, Rocket, TrendingUp } from 'lucide-react';

const STEPS = [
  {
    icon: Compass,
    label: 'DISCOVER',
    title: 'Learn your HustleDNA.',
    description: 'Understand the kind of entrepreneur you are wired to be.',
  },
  {
    icon: Target,
    label: 'MATCH',
    title: 'Find businesses aligned with your circumstances.',
    description: 'See realistic models that fit your budget, skills and schedule.',
  },
  {
    icon: Hammer,
    label: 'BUILD',
    title: 'Turn your strongest match into an actual business concept.',
    description: 'Shape a brand, an offer and a concrete plan you can act on.',
  },
  {
    icon: Rocket,
    label: 'LAUNCH',
    title: 'Follow concrete steps toward your first customer.',
    description: 'Move from idea to outreach with a clear launch checklist.',
  },
  {
    icon: TrendingUp,
    label: 'GROW',
    title: 'Continue improving after launch.',
    description: 'Refine, expand and build momentum over time.',
  },
];

export default function Landing() {
  useEffect(() => {
    trackEvent('landing_view');
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-brand-gradient-soft opacity-60" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-brand-gradient opacity-20 blur-[120px]" />
        <div className="relative mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-gradient" />
            Your realistic business match
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            There Are <span className="text-gradient">1,000 Ways</span> to Make Money.
            <br className="hidden sm:block" /> You Only Need One.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            HustleDrop matches your budget, skills, personality and schedule with businesses you can
            realistically explore — then helps you build one.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              to="/discover"
              className="group inline-flex items-center gap-2 rounded-full bg-brand-gradient px-7 py-3.5 text-sm font-semibold text-white shadow-[0_8px_40px_-12px_rgba(168,85,247,0.6)] transition hover:scale-[1.02]"
            >
              FIND MY HUSTLE
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <p className="text-xs text-muted-foreground">
              Free • About 2 minutes • No business experience required
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition hover:border-white/20 sm:p-8"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient-soft text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="sm:ml-4">
                    <div className="text-sm font-semibold tracking-wider text-gradient">{step.label}</div>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/discover"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-foreground transition hover:border-white/30"
          >
            Start with DISCOVER
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          HustleDrop · No guaranteed income. No get-rich-quick. Just realistic paths you can actually explore.
        </div>
      </footer>
    </div>
  );
}