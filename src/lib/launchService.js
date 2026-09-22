import { base44 } from '@/api/base44Client';

// ============================================================
// LAUNCH MODE — a deterministic game layer over REAL actions.
// The game IS the real-world launch journey: every XP point, mission
// and level corresponds to a legitimate business action. No AI, no
// scoring changes — progress is measured from prospect records, so
// it persists across sessions and devices and cannot be farmed.
// ============================================================

export const STATUS_LABELS = {
  prospect: 'PROSPECT',
  contacted: 'CONTACTED',
  conversation: 'CONVERSATION',
  followed_up: 'FOLLOWED UP',
  lead: 'LEAD',
  customer: 'CUSTOMER',
  declined: 'DECLINED',
};

export const CHANNEL_OPTIONS = [
  'facebook_group',
  'nextdoor',
  'linkedin',
  'instagram',
  'local_event',
  'referral',
  'walk_in',
  'email',
  'other',
];

export const OBJECTION_OPTIONS = [
  { value: 'too_expensive', label: 'Too expensive' },
  { value: 'not_interested', label: 'Not interested' },
  { value: 'bad_timing', label: 'Bad timing' },
  { value: 'didnt_understand', label: "Didn't understand the offer" },
  { value: 'already_has_solution', label: 'Already has a solution' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: "Don't know" },
];

// Real-action ladder for a prospect.
export const PROSPECT_ACTIONS = {
  prospect: { next: 'contacted', label: 'I SENT OUTREACH' },
  contacted: { next: 'conversation', label: 'RECORD CONVERSATION' },
  conversation: { next: 'followed_up', label: 'FOLLOW-UP SENT' },
  followed_up: { next: 'lead', label: 'MARK AS LEAD' },
};

// Deterministic mission definitions. DNA changes HOW missions are
// recommended — never the goal (market validation, first customer).
export const MISSION_DEFS = [
  {
    type: 'loadout',
    node: 'LOADOUT',
    title: 'LAUNCH LOADOUT',
    target: 1,
    xp: 0,
    difficulty: 1,
    time: '5 min',
    cost: '$0',
    mission: 'Open your LOADOUT — every asset you accepted in BUILD, ready to use.',
    why: 'You built real assets. Having them one tap away is the difference between sending the message tonight and scrolling past it.',
  },
  {
    type: 'prospect_hunt',
    node: 'PROSPECT HUNT',
    title: 'PROSPECT HUNT',
    target: 10,
    xp: 150,
    difficulty: 2,
    time: '30 min',
    cost: '$0',
    mission: 'Find 10 people or organizations matching your ideal customer. Add each one to your roster.',
    why: 'Ten real names beat a hundred maybes — outreach only works when there is someone to send it to.',
  },
  {
    type: 'first_contact',
    node: 'FIRST CONTACT',
    title: 'FIRST CONTACT',
    target: 1,
    xp: 50,
    difficulty: 3,
    time: '10 min',
    cost: '$0',
    mission: 'Send your first outreach message to a real prospect.',
    why: 'The hardest message is usually the first one. Everything after this gets easier.',
  },
  {
    type: 'conversations',
    node: '3 CONVERSATIONS',
    title: '3 CONVERSATIONS',
    target: 3,
    xp: 300,
    difficulty: 3,
    time: 'ongoing',
    cost: '$0',
    mission: 'Hold 3 real conversations with prospects — questions, answers, interest.',
    why: 'Conversations are where you learn what people actually want — and whether your offer lands.',
  },
  {
    type: 'follow_up',
    node: 'THE FOLLOW-UP',
    title: 'THE FOLLOW-UP',
    target: 1,
    xp: 50,
    difficulty: 2,
    time: '10 min',
    cost: '$0',
    mission: 'Send one real follow-up to a prospect you already contacted.',
    why: 'Most people say yes on the second or third touch, not the first. Polite persistence wins.',
  },
  {
    type: 'first_lead',
    node: 'FIRST LEAD',
    title: 'FIRST LEAD',
    target: 1,
    xp: 250,
    difficulty: 4,
    time: 'ongoing',
    cost: '$0',
    mission: 'Turn a warm prospect into a qualified lead — someone seriously interested.',
    why: 'A lead is proof your offer has pull, not just push.',
  },
  {
    type: 'first_customer',
    node: 'FIRST CUSTOMER',
    title: 'GET YOUR FIRST CUSTOMER',
    target: 1,
    xp: 1000,
    difficulty: 5,
    time: 'ongoing',
    cost: '$0',
    mission: 'Close your first paying customer using your offer, price and scripts.',
    why: 'One real payment validates more than a hundred plans.',
  },
];

// Total achievable XP before the first customer — powers the HUD progress bar.
export const XP_GOAL = MISSION_DEFS.reduce((sum, d) => sum + d.xp, 0) + 100; // +100 market-feedback bonus

// HustleDNA shapes mission recommendations — never the goal.
export const DNA_MISSION_STYLE = {
  hustler: 'Fast experiments beat perfect plans — send the message, learn, adjust.',
  digital_builder:
    "Keep it simple and measurable — track who you contacted and what happened. Don't build more systems before you have a customer.",
  creator: 'A quick sample or demo is your best opener — but ship it and send it; polish later.',
  connector: 'Warm intros and genuine conversations are your unfair advantage — start with people you know.',
  operator: 'Run outreach like a checklist: a few prospects every day, tracked and repeatable.',
  builder: 'A tangible sample or live demonstration speaks for you — make one, show it.',
};

// Equipped Build assets surfaced contextually inside each mission (Launch
// uses them as read-only tools; Build stays where they are edited).
export const MISSION_EQUIPPED = {
  prospect_hunt: ['customer', 'intro'],
  first_contact: ['dm', 'email', 'in_person'],
  conversations: ['in_person', 'intro', 'objection'],
  follow_up: ['follow_up', 'follow_up_2'],
  first_lead: ['follow_up', 'objection', 'price'],
  first_customer: ['offer', 'price', 'objection', 'core_message'],
};

// One clear primary action per mission.
export const PRIMARY_CTA = {
  prospect_hunt: 'LOG A PROSPECT',
  first_contact: 'SEND YOUR FIRST OUTREACH',
  conversations: 'LOG A CONVERSATION',
  follow_up: 'SEND A FOLLOW-UP',
  first_lead: 'TURN A PROSPECT INTO A LEAD',
  first_customer: 'RECORD YOUR FIRST CUSTOMER',
};

export const ACHIEVEMENTS = {
  first_move: { label: 'FIRST MOVE', desc: 'Completed first real Launch action.' },
  out_of_the_lab: { label: 'OUT OF THE LAB', desc: 'Showed the offer to a real potential customer.' },
  no_fear: { label: 'NO FEAR', desc: 'Sent first outreach.' },
  conversation_starter: { label: 'CONVERSATION STARTER', desc: 'Completed first qualified customer conversation.' },
  the_follow_up: { label: 'THE FOLLOW-UP', desc: 'Completed first real follow-up.' },
  market_signal: { label: 'MARKET SIGNAL', desc: 'Recorded meaningful customer feedback.' },
  first_lead: { label: 'FIRST LEAD', desc: 'Generated first qualified lead.' },
  first_customer: { label: 'FIRST CUSTOMER', desc: 'Recorded first paying customer.' },
};

// ---------- Deterministic stats (pure — no SDK, no side effects) ----------

export function bestCustomerSegment(customerContent) {
  if (!customerContent || !Array.isArray(customerContent.segments) || customerContent.segments.length === 0) {
    return null;
  }
  const idx = typeof customerContent.best_first_index === 'number' ? customerContent.best_first_index : 0;
  return customerContent.segments[idx] || customerContent.segments[0];
}

export function computeLaunchStats(prospects, missions) {
  const byStatus = (statuses) => (prospects || []).filter((p) => statuses.includes(p.status)).length;
  const prospectCount = (prospects || []).length;
  const contactedCount = byStatus(['contacted', 'conversation', 'followed_up', 'lead', 'customer', 'declined']);
  const conversationCount = byStatus(['conversation', 'followed_up', 'lead', 'customer']);
  const followedUpCount = byStatus(['followed_up', 'lead', 'customer']);
  const leadCount = byStatus(['lead', 'customer']);
  const customerCount = byStatus(['customer']);
  const feedbackCount = byStatus(['declined']);
  const loadoutDone = (missions || []).some((m) => m.mission_type === 'loadout' && m.status === 'completed');

  // XP = real actions only. Milestone XP is inherently once-only; repeatable
  // actions are capped, so XP can't be farmed.
  const xp =
    Math.min(prospectCount, 10) * 15 +
    (contactedCount > 0 ? 50 : 0) +
    Math.min(conversationCount, 3) * 100 +
    (followedUpCount > 0 ? 50 : 0) +
    (feedbackCount > 0 ? 100 : 0) +
    (leadCount > 0 ? 250 : 0) +
    (customerCount > 0 ? 1000 : 0);

  const counts = {
    loadout: loadoutDone ? 1 : 0,
    prospect_hunt: prospectCount,
    first_contact: contactedCount,
    conversations: conversationCount,
    follow_up: followedUpCount,
    first_lead: leadCount,
    first_customer: customerCount,
  };

  const missionStates = MISSION_DEFS.map((def, index) => {
    const current = Math.min(counts[def.type] || 0, def.target);
    return { ...def, index, current_count: current, completed: current >= def.target };
  });
  const activeIndex = missionStates.findIndex((m) => !m.completed);

  return {
    prospectCount,
    contactedCount,
    conversationCount,
    followedUpCount,
    leadCount,
    customerCount,
    feedbackCount,
    xp,
    missionStates,
    activeIndex,
    level: customerCount > 0 ? 4 : 3,
    counts,
  };
}

export function achievementTypesFor(stats) {
  const t = [];
  if (stats.counts.loadout > 0 || stats.prospectCount > 0 || stats.contactedCount > 0) t.push('first_move');
  if (stats.contactedCount > 0) t.push('no_fear');
  if (stats.conversationCount > 0) {
    t.push('out_of_the_lab');
    t.push('conversation_starter');
  }
  if (stats.followedUpCount > 0) t.push('the_follow_up');
  if (stats.feedbackCount > 0) t.push('market_signal');
  if (stats.leadCount > 0) t.push('first_lead');
  if (stats.customerCount > 0) t.push('first_customer');
  return t;
}

// Mission recommendations come from the user's ACCEPTED modules + DNA.
export function missionRecommendations(accepted, dna) {
  const recs = [];
  const seg = bestCustomerSegment(accepted?.customer);
  if (seg?.where_to_find) recs.push(seg.where_to_find);
  const m = accepted?.marketing || {};
  if (m.local_marketing_idea) recs.push(m.local_marketing_idea);
  if (m.online_marketing_idea) recs.push(m.online_marketing_idea);
  const style = dna ? DNA_MISSION_STYLE[dna.primary_type] : null;
  if (style) recs.push(style);
  return recs;
}

// Everything the user accepted in BUILD becomes their Launch Loadout.
export function buildLoadoutItems(accepted) {
  const items = [];
  const b = accepted?.brand || {};
  const c = accepted?.customer;
  const o = accepted?.offer || {};
  const p = accepted?.pricing || {};
  const s = accepted?.sales || {};
  const m = accepted?.marketing || {};
  if (b.chosen_name) items.push({ key: 'name', label: 'BUSINESS NAME', value: b.chosen_name });
  const seg = bestCustomerSegment(c);
  if (seg) items.push({ key: 'customer', label: 'IDEAL CUSTOMER', value: `${seg.who}\n\nProblem: ${seg.problem}` });
  if (o.name) items.push({ key: 'offer', label: 'OFFER', value: `${o.name}\n\n${o.customer_gets || ''}` });
  if (p.test_price) items.push({ key: 'price', label: 'TEST PRICE', value: p.test_price });
  if (s.introduction) items.push({ key: 'intro', label: 'SHORT INTRODUCTION', value: s.introduction });
  if (s.dm_script) items.push({ key: 'dm', label: 'DM SCRIPT', value: s.dm_script });
  if (s.email_script) items.push({ key: 'email', label: 'EMAIL SCRIPT', value: s.email_script });
  if (s.in_person_script) items.push({ key: 'in_person', label: 'IN-PERSON SCRIPT', value: s.in_person_script });
  if (s.follow_up_1) items.push({ key: 'follow_up', label: 'FOLLOW-UP SCRIPT', value: s.follow_up_1 });
  if (s.follow_up_2) items.push({ key: 'follow_up_2', label: 'FOLLOW-UP 2', value: s.follow_up_2 });
  if (s.common_objection) items.push({ key: 'objection', label: 'COMMON OBJECTION + RESPONSE', value: `${s.common_objection}\n\n${s.objection_response || ''}` });
  if (m.core_message) items.push({ key: 'core_message', label: 'CORE MARKETING MESSAGE', value: m.core_message });
  if (m.simple_promotion) items.push({ key: 'promotion', label: 'PROMOTION', value: m.simple_promotion });
  if (m.referral_idea) items.push({ key: 'referral', label: 'REFERRAL OFFER', value: m.referral_idea });
  return items;
}

// ---------- SDK operations (all progress persists server-side) ----------

async function loadQuestState(quest) {
  const [missions, prospects, achievements] = await Promise.all([
    base44.entities.LaunchMission.filter({ launch_quest_id: quest.id }, '-created_date', 50),
    base44.entities.Prospect.filter({ launch_quest_id: quest.id }, '-created_date', 200),
    base44.entities.Achievement.filter({ user_id: quest.user_id }, '-created_date', 100),
  ]);
  return { quest, missions: missions || [], prospects: prospects || [], achievements: achievements || [] };
}

export async function loadLaunchData() {
  const quests = await base44.entities.LaunchQuest.list('-created_date', 10);
  const quest = (quests || [])[0] || null;
  if (!quest) return { quest: null };
  return loadQuestState(quest);
}

export async function startLaunchQuest({ userId, selectedBusinessId }) {
  const quest = await base44.entities.LaunchQuest.create({
    user_id: userId,
    selected_business_id: selectedBusinessId,
    status: 'active',
    current_stage: 'loadout',
    xp: 0,
    level: 3,
    streak: 0,
  });
  await base44.entities.LaunchMission.bulkCreate(
    MISSION_DEFS.map((def, i) => ({
      launch_quest_id: quest.id,
      mission_type: def.type,
      title: def.title,
      target_count: def.target,
      current_count: 0,
      xp_reward: def.xp,
      status: i === 0 ? 'active' : 'locked',
      unlocked_at: i === 0 ? new Date().toISOString() : null,
    }))
  );
  return loadQuestState(quest);
}

function refreshMissions(missions, updates) {
  const map = new Map((updates || []).map((u) => [u.id, u]));
  return missions.map((m) => (map.has(m.id) ? { ...m, ...map.get(m.id) } : m));
}

// Recomputes the whole game state from records (idempotent — no double XP,
// no farming) and persists quest, missions and any new achievements.
async function recalc(quest, { actionToday = false } = {}) {
  const state = await loadQuestState(quest);
  const stats = computeLaunchStats(state.prospects, state.missions);

  // Streak — consecutive days with a meaningful action. No punishment, no
  // manipulative messaging; a break simply resets.
  let streak = state.quest.streak || 0;
  let lastAction = state.quest.last_action_date || null;
  if (actionToday && lastAction !== new Date().toISOString().slice(0, 10)) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = lastAction === yesterday ? streak + 1 : 1;
    lastAction = new Date().toISOString().slice(0, 10);
  }

  const activeDef = stats.activeIndex >= 0 ? stats.missionStates[stats.activeIndex] : null;
  const updates = {};
  if (state.quest.xp !== stats.xp) updates.xp = stats.xp;
  if (state.quest.level !== stats.level) updates.level = stats.level;
  const currentStage = activeDef ? activeDef.type : 'first_customer';
  if (state.quest.current_stage !== currentStage) updates.current_stage = currentStage;
  if (stats.customerCount > 0 && state.quest.status !== 'completed') {
    updates.status = 'completed';
    updates.completed_at = new Date().toISOString();
  }
  if (streak !== state.quest.streak) updates.streak = streak;
  if (lastAction !== state.quest.last_action_date) updates.last_action_date = lastAction;

  let updatedQuest = state.quest;
  if (Object.keys(updates).length > 0) {
    updatedQuest = await base44.entities.LaunchQuest.update(quest.id, updates);
    if (updates.status === 'completed') {
      // First real paying customer → the selected business is LAUNCHED (GROW
      // unlocks from the same milestone). A failure here must not block the win.
      await base44.entities.SelectedBusiness.update(quest.selected_business_id, {
        status: 'launched',
      }).catch(() => {});
    }
  }

  const missionUpdates = [];
  for (const def of stats.missionStates) {
    const rec = state.missions.find((m) => m.mission_type === def.type);
    if (!rec) continue;
    const patch = {};
    if (rec.current_count !== def.current_count) patch.current_count = def.current_count;
    const newStatus = def.completed
      ? 'completed'
      : def.index === stats.activeIndex
        ? 'active'
        : 'locked';
    if (rec.status !== newStatus) {
      patch.status = newStatus;
      if (newStatus === 'active' && !rec.unlocked_at) patch.unlocked_at = new Date().toISOString();
      if (newStatus === 'completed') patch.completed_at = new Date().toISOString();
    }
    if (Object.keys(patch).length > 0) missionUpdates.push({ id: rec.id, ...patch });
  }
  if (missionUpdates.length > 0) {
    await base44.entities.LaunchMission.bulkUpdate(missionUpdates);
  }

  // Achievements are derived from real progress — created once, never removed.
  let achievements = state.achievements;
  const existing = new Set(achievements.map((a) => a.achievement_type));
  const toCreate = achievementTypesFor(stats).filter((t) => !existing.has(t));
  if (toCreate.length > 0) {
    const created = await base44.entities.Achievement.bulkCreate(
      toCreate.map((type) => ({
        user_id: state.quest.user_id,
        achievement_type: type,
        related_business_id: state.quest.selected_business_id,
        earned_at: new Date().toISOString(),
      }))
    );
    achievements = [...achievements, ...(created || [])];
  }

  return {
    quest: updatedQuest,
    missions: refreshMissions(state.missions, missionUpdates),
    prospects: state.prospects,
    achievements,
  };
}

export async function completeLoadout(quest) {
  const missions = await base44.entities.LaunchMission.filter({ launch_quest_id: quest.id }, '-created_date', 50);
  const rec = (missions || []).find((m) => m.mission_type === 'loadout');
  if (rec && rec.status !== 'completed') {
    await base44.entities.LaunchMission.update(rec.id, {
      status: 'completed',
      current_count: 1,
      completed_at: new Date().toISOString(),
    });
  }
  return recalc(quest, { actionToday: true });
}

export async function addProspect(quest, { name_or_alias, channel, notes }) {
  await base44.entities.Prospect.create({
    launch_quest_id: quest.id,
    name_or_alias: String(name_or_alias || '').trim().slice(0, 120),
    channel: channel || 'other',
    status: 'prospect',
    notes: notes || '',
  });
  return recalc(quest, { actionToday: true });
}

export async function advanceProspect(quest, prospect, nextStatus, extra = {}) {
  await base44.entities.Prospect.update(prospect.id, {
    status: nextStatus,
    notes: extra.prospect_notes !== undefined ? extra.prospect_notes : prospect.notes,
  });
  if (nextStatus === 'declined') {
    // Market feedback — stored, not shamed.
    await base44.entities.CustomerConversation.create({
      prospect_id: prospect.id,
      status: 'declined',
      outcome: 'declined',
      objection_type: extra.objection_type || 'unknown',
      notes: extra.notes || '',
    });
  }
  if (nextStatus === 'customer') {
    await base44.entities.CustomerWin.create({
      launch_quest_id: quest.id,
      offer_name: extra.offer_name || '',
      sale_amount: extra.sale_amount || null,
      acquisition_channel: extra.acquisition_channel || '',
      notes: extra.notes || '',
    });
  }
  return recalc(quest, { actionToday: true });
}