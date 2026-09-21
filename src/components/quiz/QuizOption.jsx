import React from 'react';
import { Check } from 'lucide-react';

export default function QuizOption({ option, selected, dimmed = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? 'border-primary/60 bg-brand-gradient-soft'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25'
      } ${dimmed ? 'opacity-40' : ''}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          selected ? 'border-transparent bg-brand-gradient' : 'border-white/20'
        }`}
      >
        {selected && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-foreground">{option.label}</span>
        {option.description && (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            {option.description}
          </span>
        )}
      </span>
    </button>
  );
}