import { base44 } from '@/api/base44Client';

// Supported analytics event names for HustleDrop.
export const EVENT_NAMES = [
  'landing_view',
  'quiz_started',
  'quiz_question_completed',
  'quiz_completed',
  'dna_generated',
  'dna_viewed',
  'avatar_selected',
  'dna_shared',
  'result_viewed',
  'result_shared',
  'alternate_match_viewed',
  'comparison_opened',
  'rematch_started',
  'tie_breaker_presented',
  'tie_breaker_completed',
  'account_created',
  'business_selected',
  'checkout_started',
  'purchase_completed',
  'builder_started',
  'module_generated',
  'module_regenerated',
  'module_edited',
  'module_accepted',
  'module_approved',
  'builder_completed',
  'ask_hustledrop_used',
  'launch_task_completed',
  'first_outreach_recorded',
  'first_lead_recorded',
  'first_customer_recorded',
  'referral_created',
  'referral_converted',
  'subscription_started',
  'subscription_cancelled',
];

// Fire-and-forget event tracker. Never throws into the UI.
export function trackEvent(eventName, properties = {}) {
  try {
    base44.analytics.track({ eventName, properties });
  } catch (e) {
    // analytics must never break the user experience
  }
}