import React from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { LogOut } from 'lucide-react';

const NAV = [
  { label: 'DISCOVER', path: '/discover' },
  { label: 'MATCH', path: '/results' },
  { label: 'BUILD', path: '/build' },
  { label: 'LAUNCH', path: '/launch' },
  { label: 'GROW', path: '/grow' },
];

export default function AppLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white">H</span>
            <span className="text-sm font-semibold tracking-[0.2em] text-foreground sm:text-base">HUSTLEDROP</span>
          </Link>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground sm:inline-block"
              >
                Admin
              </Link>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6 scrollbar-none">
          <div className="flex h-12 items-center gap-1">
            {NAV.map((item) => {
              const active = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wider transition ${
                    active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-gradient" />
                  )}
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}