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

  // Identity stage: full brand kit for the chosen name (new and legacy field
  // names are both supported, so existing accepted brands keep rendering)
  const identityFields = [
    ['tagline', 'TAGLINE'],
    ['one_sentence_positioning', 'ONE-SENTENCE POSITIONING'],
    ['short_bio', 'SHORT BIO'],
    ['short_description', 'SHORT BUSINESS DESCRIPTION'],
    ['customer_facing_description', 'CUSTOMER-FACING DESCRIPTION'],
    ['brand_personality', 'BRAND PERSONALITY'],
    ['visual_style', 'SUGGESTED VISUAL STYLE'],
    ['visual_direction', 'VISUAL DIRECTION'],
    ['color_direction', 'COLOR DIRECTION'],
    ['logo_concept_description', 'LOGO CONCEPT DESCRIPTION'],
  ].filter(([k]) => content[k]);

  return (
    <div>
      <div className="rounded-xl border-2 border-primary/40 bg-brand-gradient-soft p-4 text-center">
        <span className="text-xl font-bold text-foreground">{content.chosen_name}</span>
      </div>
      <Card>
        <div className="space-y-3">
          {identityFields.map(([k, label]) => (
            <Field key={k} label={label}>{content[k]}</Field>
          ))}
        </div>
      </Card>
      <Note>
        Brand kit described only — no logo is generated here, and no domain, trademark or handle availability is
        claimed. Verify business-name, domain and trademark availability before committing.
      </Note>
    </div>
  );
}