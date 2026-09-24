import React, { useEffect, useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { DISTRICTS, getDistrictAsset } from './districtManifest';

// ============================================================
// NEON HUSTLE CITY — reusable isometric city presentation.
//
// Mounted by the City page (/city) with states derived from existing records
// via deriveDistrictStates. Purely presentational — it persists nothing,
// grants nothing and invents no progression; the district state comes
// entirely from the caller. Every district is selectable; locked districts
// keep their dimmed styling but still open their (read-only) detail panel.
// ============================================================

function DistrictTile({ district, state, onSelect, offset }) {
  const [assetFailed, setAssetFailed] = useState(false);
  const asset = assetFailed ? null : getDistrictAsset(district.key, state);
  // Every district is SELECTABLE (viewing is always allowed — it selects
  // nothing and unlocks nothing); state only drives the visual treatment.
  const clickable = !!onSelect;
  const Icon = district.icon;
  const label = `${district.name} — ${state}`;

  useEffect(() => {
    setAssetFailed(false);
  }, [asset]);

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={clickable ? () => onSelect(district.key, state) : undefined}
      aria-label={label}
      style={{ marginLeft: `${offset}%` }}
      className={`flex w-full max-w-xs items-center gap-3 rounded-xl border p-3 text-left transition motion-reduce:transition-none ${
        state === 'completed'
          ? 'border-gradient glow-primary'
          : state === 'available'
            ? 'border-primary/60 bg-brand-gradient-soft shadow-[0_0_24px_rgba(168,85,247,0.3)] hover:scale-[1.01]'
            : 'border-white/10 bg-white/[0.02] opacity-50'
      } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span
        aria-hidden="true"
        className={`flex h-12 w-12 shrink-0 rotate-45 items-center justify-center rounded-lg border-2 ${
          state === 'completed'
            ? 'border-transparent bg-brand-gradient text-white'
            : state === 'available'
              ? 'border-primary/60 bg-primary/15 text-primary'
              : 'border-white/10 bg-white/[0.02] text-muted-foreground'
        }`}
      >
        <span className="-rotate-45">
          {asset ? (
            <img
              src={asset}
              onError={() => setAssetFailed(true)}
              alt=""
              draggable={false}
              className="pixelated h-9 w-9 object-contain"
            />
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-mono text-xs font-bold tracking-wider text-foreground">
          {district.name}
        </span>
        <span className="mt-0.5 block text-[10px] leading-relaxed text-muted-foreground">{district.tagline}</span>
        <span className="mt-0.5 block font-mono text-[8px] font-bold tracking-widest text-muted-foreground">
          {state === 'completed' ? 'COMPLETE' : state === 'available' ? 'AVAILABLE' : 'LOCKED'}
        </span>
      </span>
      {state === 'completed' && <Check className="h-4 w-4 shrink-0 text-primary" />}
      {state === 'locked' && <Lock className="h-3.5 w-3.5 shrink-0" />}
    </button>
  );
}

export default function CityMap({ states = {}, onSelect, className = '' }) {
  // Displayed bottom-up: the journey climbs from Crossroads (bottom-left)
  // to Skyline Heights (top-right) as a rising isometric staircase.
  const layout = [...DISTRICTS].reverse().map((d, i, arr) => ({
    district: d,
    offset: (arr.length - 1 - i) * 5,
  }));

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 ${className}`}>
      <div className="text-center text-xs font-semibold tracking-[0.25em] text-muted-foreground">NEON HUSTLE CITY</div>
      <div className="mt-5 flex flex-col items-center gap-3">
        {layout.map(({ district, offset }) => (
          <DistrictTile
            key={district.key}
            district={district}
            state={states[district.key] || 'locked'}
            onSelect={onSelect}
            offset={offset}
          />
        ))}
      </div>
      <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
        Every district unlocks through real progress — your DNA, build, launch and customer records decide what opens.
      </p>
    </div>
  );
}