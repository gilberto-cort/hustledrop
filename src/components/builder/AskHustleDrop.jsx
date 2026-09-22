import React, { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { askHustleDrop } from '@/lib/builderService';

const EXAMPLES = [
  'Make this offer simpler.',
  'Give me another name.',
  'How could I lower startup costs?',
  'Rewrite this message so it sounds less salesy.',
  'Help me explain this business in one sentence.',
];

// ASK HUSTLEDROP — contextual advisory assistant. It knows the selected
// business, accepted modules, HustleProfile and HustleDNA (assembled
// server-side) but can never modify content — advice only.
const DEFAULT_DESCRIPTION =
  'Your assistant knows your business, accepted modules, profile and HustleDNA. Advice only — it never changes your content. Apply changes yourself via EDIT or TRY ANOTHER.';

export default function AskHustleDrop({
  onUsed,
  examples = EXAMPLES,
  description = DEFAULT_DESCRIPTION,
  placeholder = 'Ask anything about building your business…',
}) {
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(false);

  const ask = async (q) => {
    const text = (q || question).trim();
    if (!text || busy) return;
    setBusy(true);
    setError(false);
    setAnswer(null);
    try {
      const res = await askHustleDrop(text);
      if (res.status === 'ok') {
        setAnswer(res.answer);
        if (onUsed) onUsed();
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">ASK HUSTLEDROP</span>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{description}</p>

      <div className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-input bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button
          onClick={() => ask()}
          disabled={busy || !question.trim()}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-4 py-2.5 text-xs font-bold tracking-wider text-white transition disabled:opacity-40"
        >
          <Send className="h-3.5 w-3.5" />
          {busy ? 'THINKING…' : 'ASK'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {examples.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuestion(ex);
              ask(ex);
            }}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-muted-foreground transition hover:text-foreground"
          >
            {ex}
          </button>
        ))}
      </div>

      {answer && (
        <div className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-foreground/90">
          {answer}
        </div>
      )}
      {error && (
        <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-muted-foreground">
          HustleDrop couldn't answer right now — please try again in a moment.
        </p>
      )}
    </section>
  );
}