import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { LogOut, ArrowLeft } from 'lucide-react';

const NAV = [
  { label: 'Business Models', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Matches', path: '/admin/matches' },
  { label: 'Purchases', path: '/admin/purchases' },
  { label: 'AI Usage', path: '/admin/ai-usage' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Referrals', path: '/admin/referrals' },
  { label: 'Match Tester', path: '/admin/match-tester' },
  { label: 'DNA Tester', path: '/admin/dna-tester' },
  { label: 'Avatars', path: '/admin/avatars' },
];

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to app</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm font-semibold tracking-[0.2em] text-foreground">ADMIN</span>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6 scrollbar-none">
          <div className="flex h-12 items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition ${
                    isActive ? 'bg-white/5 text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}