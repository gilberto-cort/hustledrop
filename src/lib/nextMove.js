import { BUILD_MODULES } from '@/lib/builderService';
import { resolveStage } from '@/lib/progression';

// DETERMINISTIC NEXT MOVE — no AI, no guesses. Exactly ONE recommended action
// derived from the user's real persisted state, in funnel order. The stage
// badge comes from the SAME resolver the Dashboard and Journey use (one
// progression system).

export function getNextMove(state) {
  const stage = resolveStage(state);
  const acceptedSet = new Set(state.acceptedModules || []);
  const nextModule = BUILD_MODULES.find((m) => !acceptedSet.has(m.key));

  if (!state.profileComplete) {
    return {
      label: 'FINISH YOUR HUSTLEMATCH',
      description: 'Answer 13 quick questions to reveal your HustleDNA and your top business matches.',
      cta: 'TAKE THE QUIZ',
      path: '/discover',
      stage,
    };
  }
  if (!state.hasMatch) {
    return {
      label: 'SEE YOUR MATCH',
      description: 'Your profile is complete — see the businesses that fit your real circumstances.',
      cta: 'VIEW RESULTS',
      path: '/results',
      stage,
    };
  }
  if (!state.selected) {
    return {
      label: 'CHOOSE YOUR HUSTLE',
      description: 'Pick the business you want to build from your match results.',
      cta: 'PICK MY BUSINESS',
      path: '/results',
      stage,
    };
  }
  if (!state.entitled) {
    return {
      label: 'BUILD YOUR BUSINESS',
      description: 'Unlock the personalized Business Builder for your selected business — $19, one-time.',
      cta: 'UNLOCK BUILDER',
      path: '/build',
      stage,
    };
  }
  if (nextModule) {
    return {
      label: `DEFINE YOUR ${nextModule.label}`,
      description: 'Your next Builder step — generated from your real data, kept by you.',
      cta: 'START BUILDING',
      path: '/build',
      stage,
    };
  }
  if (!state.quest) {
    return {
      label: 'START YOUR FIRST CUSTOMER QUEST',
      description: 'Your business is built. Time to find real people to talk to.',
      cta: 'ENTER LAUNCH MODE',
      path: '/launch',
      stage,
    };
  }
  if (!state.firstCustomer) {
    return {
      label: 'CONTINUE YOUR LAUNCH',
      description: 'Keep moving on your quest to a first real customer.',
      cta: 'GO TO LAUNCH',
      path: '/launch',
      stage,
    };
  }
  return {
    label: 'ENTER GROW MODE',
    description: 'You have a customer. The Road to 5 is open.',
    cta: 'KEEP GROWING',
    path: '/grow',
    stage,
  };
}

export function getStage(state) {
  return resolveStage(state);
}