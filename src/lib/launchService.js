import { base44 } from '@/api/base44Client';
import { settleDailyQuest, undoDailySettle } from '@/lib/dailyQuestService';

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

// Real-action ladder for a prospect — first-person action language only.
export const PROSPECT_ACTIONS = {
  prospect: { next: 'contacted', label: 'I REACHED OUT' },
  contacted: { next: 'conversation', label: 'I HAD A CONVERSATION' },
  conversation: { next: 'followed_up', label: 'I FOLLOWED UP' },
  followed_up: { next: 'lead', label: "THEY'RE INTERESTED" },
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
    mission: 'Spot people who fit your ideal customer — tap the button the moment you find one. Names and details are optional.',
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
    mission: 'Send your first real outreach message — tap it the second you hit send.',
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
    mission: 'Have 3 real back-and-forth conversations — questions, answers, interest.',
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
    mission: "Someone tells you they're seriously interested — tap it and pick who.",
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

// ---------- Launch 2.0: one-tap action config ----------
// Each mission shows ONE big first-person button. `from` lists the prospect
// statuses the action can apply to; when no contact is selected (or none
// exist yet) the tap records an unnamed contact at the next status — the
// user's real action, with details optional.
export const MISSION_ONE_TAP = {
  loadout: { cta: 'OPEN MY LOADOUT' },
  prospect_hunt: { cta: 'I FOUND A POTENTIAL CUSTOMER', quickName: 'New contact' },
  first_contact: { cta: 'I REACHED OUT', from: ['prospect'], quickName: 'Someone I messaged' },
  conversations: { cta: 'I HAD A CONVERSATION', from: ['contacted'], quickName: 'Someone I talked to' },
  follow_up: { cta: 'I FOLLOWED UP', from: ['conversation'], quickName: 'Someone I messaged again' },
  first_lead: { cta: "SOMEONE'S INTERESTED", from: ['followed_up', 'conversation', 'contacted', 'prospect'], quickName: 'Someone interested' },
  first_customer: {
    cta: 'I LANDED MY FIRST CUSTOMER',
    from: ['lead', 'followed_up', 'conversation', 'contacted', 'prospect'],
    confirm: true,
  },
};

const ONE_TAP_NEXT = {
  prospect_hunt: 'prospect',
  first_contact: 'contacted',
  conversations: 'conversation',
  follow_up: 'followed_up',
  first_lead: 'lead',
  first_customer: 'customer',
};

// Contacts the active mission's one-tap action can apply to.
export function eligibleProspects(missionType, prospects) {
  const from = MISSION_ONE_TAP[missionType] && MISSION_ONE_TAP[missionType].from;
  if (!from) return [];
  return (prospects || []).filter((p) => from.includes(p.status));
}

export const ACHIEVEMENTS = {
  first_move: { label: 'FIRST MOVE', desc: 'Completed first real Launch action.' },
  out_of_the_lab: { label: 'OUT OF THE LAB', desc: 'Showed the offer to a real potential customer.' },
  no_fear: { label: 'NO FEAR', desc: 'Sent first outreach.' },
  conversation_starter: { label: 'CONVERSATION STARTER', desc: 'Completed first qualified customer conversation.' },
  the_follow_up: { label: 'THE FOLLOW-UP', desc: 'Completed first real follow-up.' },
  market_signal: { label: 'MARKET SIGNAL', desc: 'Recorded meaningful customer feedback.' },
  first_lead: { label: 'FIRST LEAD', desc: 'Generated first qualified lead.' },
  first_customer: { label: 'FIRST CUSTOMER', desc: 'Recorded first paying customer.' },
  prospector: { label: 'PROSPECTOR', desc: 'Logged 10 qualified prospects.' },
  social_proof: { label: 'SOCIAL PROOF', desc: 'Requested honest customer feedback after a completed job.' },
  referral_ready: { label: 'REFERRAL READY', desc: 'Created a simple referral system.' },
  proof_of_motion: { label: 'PROOF OF MOTION', desc: 'Recorded three customers.' },
  high_five: { label: 'HIGH FIVE', desc: 'Recorded five customers.' },
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
  if (stats.prospectCount >= 10) t.push('prospector');
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
  // Correction path: undoing the only customer returns the quest and the
  // business to their pre-launch state — derived state always matches records.
  if (stats.customerCount === 0 && state.quest.status === 'completed') {
    updates.status = 'active';
    updates.completed_at = null;
    await base44.entities.SelectedBusiness.update(quest.selected_business_id, {
      status: 'building',
    }).catch(() => {});
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

// Re-derive quest state from records — shared by Grow's pipeline so Launch
// and Grow always read the same persistent metrics.
export async function refreshQuest(quest, { actionToday = false } = {}) {
  return recalc(quest, { actionToday });
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
  const created = await base44.entities.Prospect.create({
    launch_quest_id: quest.id,
    name_or_alias: String(name_or_alias || '').trim().slice(0, 120),
    channel: channel || 'other',
    status: 'prospect',
    notes: notes || '',
  });
  const next = await recalc(quest, { actionToday: true });
  // A new real contact is today's "find a prospect" daily action.
  const settled = await settleDailyQuest(quest, { kind: 'prospect_added', prospect_id: created.id });
  return { ...next, lastAdded: created, dailySettled: settled };
}

// Quick create — one-tap progress records the user's real action first;
// details can be added afterwards and are never required.
async function createProspect(quest, { name_or_alias, status }) {
  return base44.entities.Prospect.create({
    launch_quest_id: quest.id,
    name_or_alias: String(name_or_alias || 'New contact').trim().slice(0, 120),
    channel: 'other',
    status: status || 'prospect',
    notes: '',
  });
}

export async function quickAddContact(quest, name, status = 'prospect') {
  const created = await createProspect(quest, { name_or_alias: name, status });
  const next = await recalc(quest, { actionToday: true });
  // Quick records carry a real action too — settle the daily quest with
  // the action the quick contact represents (found vs. reached out).
  const settled = await settleDailyQuest(quest, {
    kind: status === 'prospect' ? 'prospect_added' : 'advance',
    to: status,
    prospect_id: created.id,
  });
  return { ...next, lastAdded: created, dailySettled: settled };
}

// ONE-TAP PROGRESS — advances the selected contact, or records the action on
// a fresh unnamed contact when nobody is selected. No fabrication: the user
// is always recording their own real action.
export async function oneTapAction(quest, missionType, prospect) {
  const nextStatus = ONE_TAP_NEXT[missionType];
  if (!nextStatus) return loadQuestState(quest);
  if (prospect && prospect.status !== nextStatus) return advanceProspect(quest, prospect, nextStatus);
  const created = await createProspect(quest, {
    name_or_alias: (MISSION_ONE_TAP[missionType] || {}).quickName,
    status: nextStatus,
  });
  const next = await recalc(quest, { actionToday: true });
  const settled = await settleDailyQuest(quest, {
    kind: 'advance',
    to: nextStatus,
    prospect_id: created.id,
  });
  return { ...next, lastAdded: created, dailySettled: settled };
}

// CORRECTION — reverses the most recent recorded action. XP, quest status,
// achievements and unlocks are all re-derived from records, so undo can
// never leave a double award behind.
export async function undoLastAction(quest, lastAction) {
  if (!lastAction || !lastAction.prospectId) return loadQuestState(quest);
  const list = await base44.entities.Prospect.filter({ launch_quest_id: quest.id }, '-created_date', 200);
  const p = (list || []).find((x) => x.id === lastAction.prospectId);
  if (!p) return loadQuestState(quest);
  if (lastAction.type === 'add') {
    // Only undo while the record is untouched since the tap.
    if (p.status === lastAction.createdStatus) await base44.entities.Prospect.delete(p.id);
  } else {
    await base44.entities.Prospect.update(p.id, { status: lastAction.prevStatus });
    if (lastAction.wasCustomer) {
      const wins = await base44.entities.CustomerWin.filter({ launch_quest_id: quest.id }, '-created_date', 50);
      if (wins && wins[0]) await base44.entities.CustomerWin.delete(wins[0].id);
    }
    if (lastAction.wasDeclined) {
      const convs = await base44.entities.CustomerConversation.filter({ prospect_id: p.id }, '-created_date', 50);
      if (convs && convs[0]) await base44.entities.CustomerConversation.delete(convs[0].id);
    }
  }
  // If this same action completed today's daily quest, its reward is
  // reversed with it — never a double award, never a stuck reward.
  await undoDailySettle(quest, {
    prospect_id: lastAction.prospectId,
    kind: lastAction.type === 'add' ? 'prospect_added' : 'advance',
  });
  return recalc(quest, {});
}

// ADD DETAILS — optional enrichment of a quick-tapped contact. Never changes
// progress counts.
export async function updateProspectDetails(quest, prospect, details) {
  await base44.entities.Prospect.update(prospect.id, {
    name_or_alias:
      details.name_or_alias !== undefined ? String(details.name_or_alias).trim().slice(0, 120) : prospect.name_or_alias,
    channel: details.channel !== undefined ? details.channel : prospect.channel,
    notes: details.notes !== undefined ? details.notes : prospect.notes,
  });
  return recalc(quest, {});
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
      display_name: extra.display_name || '',
      repeat_customer: !!extra.repeat_customer,
      referral_source: extra.referral_source || '',
      notes: extra.notes || '',
    });
  }
  const next = await recalc(quest, { actionToday: true });
  // Real pipeline action — settles today's daily quest when it qualifies.
  const settled = await settleDailyQuest(quest, {
    kind: 'advance',
    from: prospect.status,
    to: nextStatus,
    prospect_id: prospect.id,
  });
  return { ...next, dailySettled: settled };
}