import React from 'react';
import { GenCTA, CopyBlock, EquippedList } from './growKit';

// THE REFERRAL — a simple, ethical referral mechanism. No spam loops, no
// friends' contact details without permission.
export default function ReferralMissionBody({ def, mission, equipped, busy, actions }) {
  const content = (mission && mission.content) || {};

  return (
    <div className="space-y-4">
      <EquippedList items={equipped} />

      {!content.referral_message && !def.completed && (
        <GenCTA
          label="BUILD REFERRAL OFFER"
          busy={busy}
          onClick={() => actions.onGenerate('referral')}
          note="A permission-based referral kit adapted to your business — a clear ask, an honest thank-you, nothing pushy."
        />
      )}

      {content.referral_message && (
        <div className="space-y-2">
          <CopyBlock label="REFERRAL MESSAGE" value={content.referral_message} />
          {content.referral_offer && <CopyBlock label="REFERRAL OFFER" value={content.referral_offer} />}
          {content.shareable_description && (
            <CopyBlock label="SHAREABLE DESCRIPTION" value={content.shareable_description} />
          )}
          {content.tracking_note && <CopyBlock label="TRACKING NOTE" value={content.tracking_note} />}
        </div>
      )}

      {content.referral_message && !def.completed && (
        <button
          onClick={actions.onReferralReady}
          disabled={busy}
          className="w-full rounded-full bg-brand-gradient py-3 text-sm font-bold tracking-wider text-white transition hover:scale-[1.01] disabled:opacity-40"
        >
          MARK REFERRAL SYSTEM READY
        </button>
      )}

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Only ask customers you were genuinely happy to serve, and never collect contacts of people they refer without
        permission.
      </p>
    </div>
  );
}