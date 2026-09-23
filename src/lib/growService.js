import { base44 } from '@/api/base44Client';
import { refreshQuest } from '@/lib/launchService';
import { settleDailyQuest, localDateStr } from '@/lib/dailyQuestService';

// ============================================================
// GROW MODE — "THE ROAD TO 5". The next world after Launch: real
// customers #2–#5, learning what worked, and a repeatable loop.
// Like Launch, every XP point derives from persistent real records
// (CustomerWin, GrowMission, GrowState) — never from page visits or
// refreshes — so XP cannot be fared. Launch and Grow share the SAME
// customer records (CustomerWin) and the SAME pipeline (Prospect).
// ============================================================

export const GROW_MISSION_DEFS = [
  {
    type: 'customer_1', node: 'CUSTOMER #1', title: 'CUSTOMER #1', target: 1, xp: 0, milestone: true,
    mission: 'Your first real paying customer — earned in Launch Mode.',
    why: 'One real payment taught you more than any plan. Customer #1 is where Grow begins.',
  },
  {
    type: 'review', node: 'THE REVIEW', title: 'THE REVIEW', target: 1, xp: 150,
    mission: 'Follow up with your customer and ask for honest feedback.',
    why: 'Real customer feedback can help improve the offer and provide legitimate social proof when the customer voluntarily agrees.',
  },
  {
    type: 'referral', node: 'THE REFERRAL', title: 'THE REFERRAL', target: 1, xp: 150,
    mission: 'Give satisfied customers an easy, ethical way to refer someone who might genuinely benefit.',
    why: 'Referred customers often trust faster — and referrals cost nothing but a good job and a clear ask.',
  },
  {
    type: 'repeat_win', node: 'REPEAT THE WIN', title: 'REPEAT THE WIN', target: 1, xp: 100,
    mission: 'Analyze how customer #1 found you and identify the most reasonable way to attempt it again.',
    why: 'One customer is an early signal, not a pattern — but it points somewhere. Repeat what worked, change one thing.',
  },
  {
    type: 'customer_3', node: 'CUSTOMER #3', title: 'CUSTOMER #3', target: 3, xp: 200, milestone: true,
    mission: 'Record three real paying customers.',
    why: 'Three customers is enough activity to start looking for patterns — not enough to assume the model is proven.',
  },
  {
    type: 'system', node: 'THE SYSTEM', title: 'THE SYSTEM', target: 1, xp: 250,
    mission: 'Turn repeated work into a simple repeatable process.',
    why: 'A lightweight loop you actually run beats a perfect system you never open.',
  },
  {
    type: 'customer_5', node: 'CUSTOMER #5', title: 'CUSTOMER #5', target: 5, xp: 500, milestone: true,
    mission: 'Record five real paying customers.',
    why: 'Five customers is real momentum — evidence you can do it again.',
  },
];

export const GROW_XP_GOAL = 3000;

// Equipped Build assets surfaced inside each Grow mission (read-only tools).
export const GROW_EQUIPPED = {
  review: ['customer', 'offer', 'follow_up'],
  referral: ['customer', 'offer', 'referral', 'promotion'],
  repeat_win: ['customer', 'offer', 'intro'],
  system: ['customer', 'offer', 'follow_up'],
};

export const SIDE_QUESTS = [
  { key: 'improve_offer', label: 'IMPROVE YOUR OFFER', desc: 'Tighten what customers get using what you have learned so far.', xp: 15 },
  { key: 'post_content', label: 'POST USEFUL CONTENT', desc: 'Share one genuinely helpful post where your customers actually hang out.', xp: 15 },
  { key: 'ask_feedback', label: 'ASK FOR FEEDBACK', desc: 'Check in with a past prospect or customer — no pitch, just curiosity.', xp: 15 },
  { key: 'create_referral_offer', label: 'CREATE A REFERRAL OFFER', desc: 'Make referring you one sentence easy.', xp: 15 },
  { key: 'reconnect_lead', label: 'RECONNECT WITH A WARM LEAD', desc: 'Revive one quiet conversation with a short, useful message.', xp: 15 },
  { key: 'improve_sales_message', label: 'IMPROVE YOUR SALES MESSAGE', desc: 'Sharpen your introduction using real responses you have heard.', xp: 15 },
  { key: 'portfolio_example', label: 'CREATE A PORTFOLIO EXAMPLE', desc: 'Show one piece of proof of what you do — a sample, photo or result.', xp: 15 },
];

export const CUSTOMER_SOURCE_OPTIONS = [
  'direct_outreach',
  'referral',
  'social_media',
  'local_networking',
  'online_community',
  'search',
  'marketplace_platform',
  'existing_relationship',
  'other',
];

const SOURCE_LABELS = {
  direct_outreach: 'Direct outreach',
  referral: 'Referral',
  social_media: 'Social media',
  local_networking: 'Local networking',
  online_community: 'Online community',
  search: 'Search',
  marketplace_platform: 'Marketplace / platform',
  existing_relationship: 'Existing relationship',
  other: 'Other',
};

export function sourceLabel(key) {
  return SOURCE_LABELS[key] || 'Other';
}

// ---------- Deterministic stats (pure — derived from real records) ----------

export function computeGrowStats(missions, wins, growState) {
  const customers = (wins || []).length;
  const rec = (type) => (missions || []).find((m) => m.mission_type === type) || null;
  const done = (type) => rec(type) !== null && rec(type).status === 'completed';

  const missionStates = GROW_MISSION_DEFS.map((def, index) => {
    const current_count = def.milestone
      ? Math.min(customers, def.target)
      : done(def.type) ? 1 : 0;
    return { ...def, index, current_count, completed: current_count >= def.target };
  });
  const activeIndex = missionStates.findIndex((m) => !m.completed);

  // XP — every point maps to a real completed action or milestone. Repeatable
  // sources (daily quest) are date-gated, so nothing can be fared.
  const dailyDone = Number(growState?.daily_quest_completions || 0);
  const sidesDone = Math.min((growState?.completed_side_quests || []).length, SIDE_QUESTS.length);
  const xp =
    (done('review') ? 150 : 0) +
    (done('referral') ? 150 : 0) +
    (done('repeat_win') ? 100 : 0) +
    (customers >= 3 ? 200 : 0) +
    (done('system') ? 250 : 0) +
    (customers >= 5 ? 500 : 0) +
    dailyDone * 25 +
    sidesDone * 15;

  const level = customers >= 5 && done('system') ? 5 : customers >= 1 ? 4 : 3;

  return { customers, missionStates, activeIndex, xp, level };
}

export function growAchievementTypes(growStats) {
  const t = [];
  const ms = growStats.missionStates;
  if (ms.find((m) => m.type === 'review')?.completed) t.push('social_proof');
  if (ms.find((m) => m.type === 'referral')?.completed) t.push('referral_ready');
  if (growStats.customers >= 3) t.push('proof_of_motion');
  if (growStats.customers >= 5) t.push('high_five');
  return t;
}

// ---------- SDK operations (all progress persists server-side) ----------

export async function loadGrowData(quest) {
  const [missions, wins, states, achievements] = await Promise.all([
    base44.entities.GrowMission.filter({ launch_quest_id: quest.id }, '-created_date', 50),
    base44.entities.CustomerWin.filter({ launch_quest_id: quest.id }, '-created_date', 100),
    base44.entities.GrowState.filter({ launch_quest_id: quest.id }, '-created_date', 5),
    base44.entities.Achievement.filter({ user_id: quest.user_id }, '-created_date', 100),
  ]);
  return {
    missions: missions || [],
    wins: wins || [],
    growState: (states || [])[0] || null,
    achievements: achievements || [],
  };
}

// Creates the mission/state records the first time the user enters Grow.
export async function initGrow(quest) {
  const grow = await loadGrowData(quest);
  const have = new Set(grow.missions.map((m) => m.mission_type));
  const toCreate = GROW_MISSION_DEFS.filter((d) => !have.has(d.type));
  if (toCreate.length > 0) {
    await base44.entities.GrowMission.bulkCreate(
      toCreate.map((d) => ({
        launch_quest_id: quest.id,
        mission_type: d.type,
        title: d.title,
        status: 'locked',
        content: {},
        inputs: {},
      }))
    );
  }
  if (!grow.growState) {
    await base44.entities.GrowState.create({
      launch_quest_id: quest.id,
      user_id: quest.user_id,
      daily_quest_completions: 0,
      completed_side_quests: [],
    });
  }
  return recalcGrow(quest);
}

// Re-derives Grow state from records (idempotent — no double XP).
export async function recalcGrow(quest, { actionToday = false } = {}) {
  const grow = await loadGrowData(quest);
  const stats = computeGrowStats(grow.missions, grow.wins, grow.growState);

  // Streak — same rule as Launch: meaningful real actions only.
  if (actionToday) {
    let streak = quest.streak || 0;
    const lastAction = quest.last_action_date || null;
    if (lastAction !== localDateStr()) {
      const yesterday = localDateStr(new Date(Date.now() - 86400000));
      streak = lastAction === yesterday ? streak + 1 : 1;
      await base44.entities.LaunchQuest.update(quest.id, {
        streak,
        last_action_date: localDateStr(),
      });
    }
  }

  // Mission record statuses mirror the derived state.
  const updates = [];
  for (const def of stats.missionStates) {
    const rec = grow.missions.find((m) => m.mission_type === def.type);
    if (!rec) continue;
    const newStatus = def.completed
      ? 'completed'
      : def.index === stats.activeIndex
        ? 'active'
        : 'locked';
    if (rec.status !== newStatus) {
      const patch = { id: rec.id, status: newStatus };
      if (newStatus === 'active' && !rec.unlocked_at) patch.unlocked_at = new Date().toISOString();
      if (newStatus === 'completed') patch.completed_at = rec.completed_at || new Date().toISOString();
      updates.push(patch);
    }
  }
  if (updates.length > 0) await base44.entities.GrowMission.bulkUpdate(updates);

  // Achievements derived from real progress — created once, never removed.
  let achievements = grow.achievements;
  const existing = new Set(achievements.map((a) => a.achievement_type));
  const toCreate = growAchievementTypes(stats).filter((t) => !existing.has(t));
  if (toCreate.length > 0) {
    const created = await base44.entities.Achievement.bulkCreate(
      toCreate.map((type) => ({
        user_id: quest.user_id,
        achievement_type: type,
        related_business_id: quest.selected_business_id,
        earned_at: new Date().toISOString(),
      }))
    );
    achievements = [...achievements, ...(created || [])];
  }

  const missions = grow.missions.map((m) => {
    const u = updates.find((x) => x.id === m.id);
    return u ? { ...m, status: u.status, unlocked_at: u.unlocked_at || m.unlocked_at, completed_at: u.completed_at || m.completed_at } : m;
  });

  return { missions, wins: grow.wins, growState: grow.growState, achievements, stats };
}

// ---------- Mission actions (persist, then re-derive) ----------

export async function generateGrowContent(missionType, options = {}) {
  const res = await base44.functions.invoke('growGenerate', { mission_type: missionType, options });
  return res.data;
}

async function updateMission(quest, mission, patch, { actionToday = false, settleAction = null } = {}) {
  await base44.entities.GrowMission.update(mission.id, patch);
  const res = await recalcGrow(quest, { actionToday });
  if (settleAction) await settleDailyQuest(quest, settleAction);
  return res;
}

export function markReviewSent(quest, mission) {
  // A real follow-up with an existing customer — qualifies today's daily quest.
  return updateMission(quest, mission, {
    inputs: { ...(mission.inputs || {}), sent: true, sent_at: new Date().toISOString() },
  }, { actionToday: true, settleAction: { kind: 'review_sent' } });
}

export function logReviewFeedback(quest, mission, feedback) {
  return updateMission(quest, mission, {
    inputs: { ...(mission.inputs || {}), feedback: String(feedback || '').slice(0, 2000) },
    status: 'completed',
    completed_at: new Date().toISOString(),
  }, { actionToday: true });
}

export function markReferralReady(quest, mission) {
  return updateMission(quest, mission, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  }, { actionToday: true });
}

export function saveRepeatSource(quest, mission, source) {
  return updateMission(quest, mission, {
    inputs: { ...(mission.inputs || {}), source },
  }, { actionToday: true });
}

export function completeRepeatWin(quest, mission) {
  return updateMission(quest, mission, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  }, { actionToday: true });
}

export function equipSystem(quest, mission) {
  return updateMission(quest, mission, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  }, { actionToday: true });
}

// EDIT on the operating loop — the user's own text becomes the steps.
export function saveSystemSteps(quest, mission, stepsText) {
  const steps = String(stepsText || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
  return updateMission(quest, mission, {
    content: { ...(mission.content || {}), steps },
  }, { actionToday: true });
}

export async function completeSideQuest(quest, growState, key) {
  const done = (growState?.completed_side_quests || []);
  if (done.includes(key)) return { unchanged: true };
  await base44.entities.GrowState.update(growState.id, {
    completed_side_quests: [...done, key],
  });
  return recalcGrow(quest, { actionToday: true });
}

// Record a customer WITHOUT an existing pipeline record — creates a Prospect
// (status customer) + CustomerWin pair so Launch and Grow stay in sync and
// nothing is counted twice.
export async function logGrowCustomer(quest, data) {
  if (data.prospect_id) {
    await base44.entities.Prospect.update(data.prospect_id, { status: 'customer' });
  } else {
    await base44.entities.Prospect.create({
      launch_quest_id: quest.id,
      name_or_alias: String(data.name_or_alias || 'Customer').trim().slice(0, 120),
      channel: data.channel || 'other',
      status: 'customer',
      notes: data.notes || '',
    });
  }
  await base44.entities.CustomerWin.create({
    launch_quest_id: quest.id,
    offer_name: String(data.offer_name || '').slice(0, 200),
    sale_amount: data.sale_amount || null,
    acquisition_channel: data.channel || 'other',
    display_name: String(data.display_name || '').slice(0, 120),
    repeat_customer: !!data.repeat_customer,
    referral_source: String(data.referral_source || '').slice(0, 120),
    notes: data.notes || '',
  });
  await refreshQuest(quest, { actionToday: true });
  await settleDailyQuest(quest, { kind: 'customer_recorded', prospect_id: data.prospect_id || null });
  return recalcGrow(quest);
}