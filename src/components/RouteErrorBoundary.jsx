import React from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react';

// Route-level render guard: a render-time exception inside a mission screen
// must never blank the whole app to a black screen. All Builder data is
// persisted server-side, so both recovery actions are always safe.
export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    // Visible in the browser console for debugging; never crashes the app.
    console.error('[RouteErrorBoundary]', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground">WE COULDN'T LOAD THIS STEP</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Something went wrong drawing this screen. Your saved missions, name and purchase are all safe — nothing was
          lost.
        </p>
        <div className="mt-6 w-full space-y-2">
          <button
            onClick={() => this.setState({ error: null })}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01]"
          >
            <RotateCcw className="h-4 w-4" />
            RETRY
          </button>
          <button
            onClick={() => {
              window.location.href = '/dashboard';
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-3 text-sm font-bold tracking-wider text-foreground/85 transition hover:border-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
            BACK TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }
}