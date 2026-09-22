import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

// LAST-RESORT APP BOUNDARY — above routing and providers. If anything above
// or inside the providers throws during render, show a recovery screen
// instead of a black page. All user data is persisted server-side, so a
// reload is always safe.
export default class AppCrashBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('[AppCrashBoundary]', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-foreground">HUSTLEDROP HIT A SNAG</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Something went wrong while drawing the app. Your account, purchases and saved missions are all safe —
            nothing was lost.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01]"
          >
            <RotateCcw className="h-4 w-4" />
            RELOAD HUSTLEDROP
          </button>
        </div>
      </div>
    );
  }
}