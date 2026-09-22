import React, { useState } from 'react';
import { GenCTA, CopyBlock, EquippedList } from './growKit';

// THE REVIEW — honest feedback first; a review request only if the customer
// is comfortable. HustleDrop never writes reviews or testimonials.
export default function ReviewMissionBody({ def, mission, equipped, busy, actions }) {
  const [feedback, setFeedback] = useState('');
  const content = (mission && mission.content) || {};
  const inputs = (mission && mission.inputs) || {};

  return (
    <div className="space-y-4">
      <EquippedList items={equipped} />

      {!content.message && !def.completed && (
        <GenCTA
          label="PREPARE FOLLOW-UP"
          busy={busy}
          onClick={() => actions.onGenerate('review')}
          note="HustleDrop drafts a short, honest feedback request — you review, copy and send it yourself."
        />
      )}

      {content.message && <CopyBlock label="FOLLOW-UP MESSAGE" value={content.message} />}

      {content.message && !def.completed && (
        <div className="space-y-2">
          {!inputs.sent && (
            <button
              onClick={actions.onMarkSent}
              disabled={busy}
              className="w-full rounded-full border border-white/15 py-3 text-xs font-bold tracking-wider text-foreground transition hover:border-primary/40 disabled:opacity-40"
            >
              MARK SENT
            </button>
          )}
          {inputs.sent && (
            <div className="rounded-full border border-primary/30 bg-brand-gradient-soft px-3 py-1.5 text-center font-mono text-[10px] font-bold tracking-widest text-primary">
              SENT — AWAITING FEEDBACK
            </div>
          )}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="What did your customer say? Log their honest feedback…"
            className="w-full resize-none rounded-xl border border-input bg-transparent px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <button
            onClick={() => actions.onLogFeedback(feedback)}
            disabled={busy || !feedback.trim()}
            className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
          >
            LOG FEEDBACK
          </button>
        </div>
      )}

      {def.completed && inputs.feedback && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
          <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">LOGGED FEEDBACK</div>
          <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">{inputs.feedback}</p>
        </div>
      )}

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        HustleDrop never writes reviews for you — feedback and reviews come from your real customer, voluntarily.
      </p>
    </div>
  );
}