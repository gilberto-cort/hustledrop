import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Admin access required</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          You need an administrator account to view this area.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-foreground transition hover:bg-white/5"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return <Outlet />;
}