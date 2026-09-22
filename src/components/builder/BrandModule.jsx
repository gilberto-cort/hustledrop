import React from 'react';
import { Field, Card, Note } from './builderKit';

// Module 04 — BRAND. Two stages: name options first, then (after the user
// picks a name) the full identity kit. No actual logo is generated.
export default function BrandModule({ content, onPickName, onTryNames, picking }) {
  // Names stage: 5 options with one-line positioning
  if (Array.isArray(content.name_options)) {
    return (
      <div>
        <div className="space-y-2.5">
          {content.name_options.map((opt, i) => (
            <Card key={i}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{opt.name}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{opt.positioning}</p>
                </div>
                <button
                  onClick={() => onPickName && onPickName(opt.name)}
                  disabled={picking}
                  className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-[10px] font-bold tracking-wider text-foreground transition hover:border-primary/50 disabled:opacity-40"
                >
                  {picking ? 'BUILDING…' : 'USE THIS NAME'}
                </button>
              </div>
            </Card>
          ))}
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onTryNames}
            disabled={picking}
            className="rounded-full border border-white/15 px-5 py-2.5 text-xs font-bold tracking-wider text-foreground transition hover:border-white/30 disabled:opacity-40"
          >
            TRY DIFFERENT NAMES
          </button>
        </div>
        <Note>Verify business-name, domain and trademark availability before committing.</Note>
      </div>
    );
  }

  // Identity stage: full kit for the chosen name
  return (
    <div>
      <div className="rounded-xl border-2 border-primary/40 bg-brand-gradient-soft p-4 text-center">
        <span className="text-xl font-bold text-foreground">{content.chosen_name}</span>
      </div>
      <Card>
        <div className="space-y-3">
          <Field label="TAGLINE">{content.tagline}</Field>
          <Field label="SHORT BUSINESS DESCRIPTION">{content.short_description}</Field>
          <Field label="BRAND PERSONALITY">{content.brand_personality}</Field>
          <Field label="VISUAL DIRECTION">{content.visual_direction}</Field>
          <Field label="COLOR DIRECTION">{content.color_direction}</Field>
          <Field label="LOGO CONCEPT DESCRIPTION">{content.logo_concept_description}</Field>
        </div>
      </Card>
      <Note>
        Logo concept described only — no logo is generated here. Verify business-name, domain and trademark
        availability before committing.
      </Note>
    </div>
  );
}