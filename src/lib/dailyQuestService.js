import { base44 } from '@/api/base44Client';

// ============================================================
// DAILY QUEST ENGINE — ONE meaningful mission per local calendar
// day, selected from the user's real pipeline bottleneck.
//
// Rules that can never be broken here:
//  - Completion always rides on the EXISTING prospect / outreach /
//    conversation / customer records — no duplicate records.
//  - +25 XP (and the +50 weekly boss bonus) flow through the existing
//    GrowState daily-quest ledger consumed by computeGrowStats.
//  - Undoing the underlying action reverses the reward.
//  - Assignment + completion persist as DailyQuest rows, so the same
//    quest shows on the dashboard, Launch and Grow across refreshes,
//    logouts and devices. The day is the USER'S LOCAL calendar day —
//    a date only ever has one row, so timezone hops can't re-award it.
// ============================================================

export const DAILY_XP = 25;
export const BOSS_XP = 50;
export const BOSS_TARGET = 5;

export function localDateStr(d = new Date()) {
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
}

// Monday of the user's local week — scopes the weekly boss objective.
export function weekKey(d = new Date()) {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return localDateStr(monday);
}

const dayBefore = (ds) => {
  const [y, m, d] = ds.split('-').map(Number);
  return localDateStr(new Date(y, m - 1, d - 1));
};

// One mission per day — first-person CTA, honest copy, no marketing.
export const DAILY_MISSIONS = {
  advance_lead: {
    title: 'Respond to your interested lead',
    cta: 'I MOVED MY LEAD FORWARD',
    why: 'Interest cools fast — reply while it is warm.',
  },
  follow_up: {
    title: 'Follow up with an existing contact',
    cta: 'I FOLLOWED UP',
    why: 'Most yeses come after the second or third touch, not the first.',
  },
  conversation: {
    title: 'Have one real conversation',
    cta: 'I HAD A CONVERSATION',
    why: 'Back-and-forth is where you learn what people actually want.',
  },
  outreach: {
    title: 'Send one outreach message',
    cta: 'I REACHED OUT',
    why: 'One real message beats ten perfect drafts.',
  },
  find_prospect: {
    title: 'Find one potential customer',
    cta: 'I FOUND A POTENTIAL CUSTOMER',
    why: 'A name is enough — spotting one real person is the win.',
  },
  prep: {
    title: 'Plan a fresh approach',
    cta: 'I PLANNED MY NEXT MOVE',
    why: 'Your market gave you answers — turn them into a smarter plan.',
  },
};

// Selection ladder — the CURRENT bottleneck, never outreach when an
// interested customer is already waiting for a response.
export function pickDailyMission(prospects) {
  const by = (s) => (prospects || []).filter((p) => p.status === s).length;
  if (by('lead') > 0) return 'advance_lead';
  if (by('conversation') > 0 || by('followed_up') > 0) return 'follow_up';
  if (by('contacted') > 0) return 'conversation';
  if (by('prospect') > 0) return 'outreach';
  if ((prospects || []).length > 0) return 'prep'; // everyone declined — plan, don't fabricate
  return 'find_prospect';
}

// The concrete existing-record action the day's mission maps to.
export function dailyActionTarget(missionKey, prospects) {
  const list = prospects || [];
  const first = (status) => list.find((p) => p.status === status) || null;
  switch (missionKey) {
    case 'advance_lead': {
      const p = first('lead');
      return p ? { prospect: p, nextStatus: 'customer' } : null;
    }
    case 'follow_up': {
      const c = first('conversation');
      if (c) return { prospect: c, nextStatus: 'followed_up' };
      const f = first('followed_up');
      return f ? { prospect: f, nextStatus: 'lead' } : null;
    }
    case 'conversation': {
      const c = first('contacted');
      return c ? { prospect: c, nextStatus: 'conversation' } : null;
    }
    case 'outreach': {
      const p = first('prospect');
      return p ? { prospect: p, nextStatus: 'contacted' } : null;
    }
    case 'find_prospect':
      return { create: true };
    case 'prep':
      return { selfAttest: true };
    default:
      return null;
  }
}

// Which daily missions a recorded real action satisfies — a stronger
// action completes a weaker mission, never the reverse.
const SATISFIES = {
  prospect_added: ['find_prospect'],
  review_sent: ['follow_up'],
  prep: ['prep'],
  customer_recorded: ['advance_lead'],
  advance_contacted: ['outreach'],
  advance_conversation: ['outreach', 'conversation'],
  advance_followed_up: ['conversation', 'follow_up'],
  advance_lead_status: ['follow_up'],
  advance_customer: ['advance_lead', 'follow_up', 'conversation', 'outreach'],
};

function actionKey(action) {
  if (!action) return null;
  if (action.kind === 'prospect_added') return 'prospect_added';
  if (action.kind === 'review_sent') return 'review_sent';
  if (action.kind === 'prep') return 'prep';
  if (action.kind === 'customer_recorded') return 'customer_recorded';
  if (action.kind === 'advance') {
    if (action.to === 'contacted') return 'advance_contacted';
    if (action.to === 'conversation') return 'advance_conversation';
    if (action.to === 'followed_up') return 'advance_followed_up';
    if (action.to === 'lead') return 'advance_lead_status';
    if (action.to === 'customer') return 'advance_customer';
  }
  return null;
}

// XP ledger — the EXISTING GrowState daily-quest counter consumed by
// computeGrowStats (dailyDone * 25). One completion = one increment,
// so nothing can ever be farmed.
async function bumpLedger(quest, delta) {
  const states = await base44.entities.GrowState.filter({ launch_quest_id: quest.id }, '-created_date', 5);
  let state = (states || [])[0] || null;
  if (!state && delta > 0) {
    state = await base44.entities.GrowState.create({
      launch_quest_id: quest.id,
      user_id: quest.user_id,
      daily_quest_completions: 0,
      completed_side_quests: [],
    });
  }
  if (!state) return;
  const cur = Number(state.daily_quest_completions || 0);
  const nextValue = Math.max(0, cur + delta);
  if (nextValue !== cur) {
    await base44.entities.GrowState.update(state.id, { daily_quest_completions: nextValue });
  }
}

// Weekly boss — auto-defeats at the BOSS_TARGET-th completed daily of the
// week, exactly once per week. Its +50 flows through the same ledger.
async function defeatBossIfDue(quest, completedBy) {
  const week = weekKey();
  const weekRows = await base44.entities.DailyQuest.filter(
    { launch_quest_id: quest.id, record_type: 'daily', week_key: week },
    '-created_date',
    20
  );
  const done = (weekRows || []).filter((r) => r.status === 'completed').length;
  if (done < BOSS_TARGET) return null;
  const existing = await base44.entities.DailyQuest.filter(
    { launch_quest_id: quest.id, record_type: 'boss', week_key: week },
    '-created_date',
    5
  );
  if ((existing || [])[0]) return null;
  const boss = await base44.entities.DailyQuest.create({
    user_id: quest.user_id,
    launch_quest_id: quest.id,
    selected_business_id: quest.selected_business_id,
    record_type: 'boss',
    date: localDateStr(),
    week_key: week,
    mission_key: 'weekly_boss',
    status: 'completed',
    completed_at: new Date().toISOString(),
    xp_awarded: BOSS_XP,
    completed_by: completedBy,
  });
  await bumpLedger(quest, 2); // +50 through the existing ledger
  return boss;
}

// Called by the existing action services AFTER a real action persisted.
// Idempotent: today's row completes at most once, and only when the
// recorded action satisfies today's assigned mission.
export async function settleDailyQuest(quest, action) {
  try {
    const key = actionKey(action);
    if (!key) return null;
    const rows = await base44.entities.DailyQuest.filter(
      { launch_quest_id: quest.id, record_type: 'daily', date: localDateStr() },
      '-created_date',
      5
    );
    const row = (rows || [])[0];
    if (!row || row.status === 'completed' || !SATISFIES[key].includes(row.mission_key)) return null;

    const completedBy = { kind: action.kind, prospect_id: action.prospect_id || null };
    const updated = await base44.entities.DailyQuest.update(row.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      xp_awarded: DAILY_XP,
      completed_by: completedBy,
    });
    await bumpLedger(quest, 1);
    const boss = await defeatBossIfDue(quest, completedBy);
    return { daily: updated, boss };
  } catch (e) {
    // The real action already succeeded — daily bookkeeping must never
    // break it. The next load re-derives everything from records.
    console.warn('[dailyQuest] settle skipped: ' + String((e && e.message) || e));
    return null;
  }
}

// CORRECTION — undoing the action that completed today's quest reverses
// the reward (and the boss bonus if that same action defeated it).
export async function undoDailySettle(quest, undone) {
  try {
    if (!undone || !undone.prospect_id) return null;
    const rows = await base44.entities.DailyQuest.filter(
      { launch_quest_id: quest.id, record_type: 'daily', date: localDateStr() },
      '-created_date',
      5
    );
    const row = (rows || []).find(
      (r) => r.status === 'completed' && (r.completed_by || {}).prospect_id === undone.prospect_id
    );
    if (!row) return null;
    await base44.entities.DailyQuest.update(row.id, {
      status: 'active',
      completed_at: null,
      xp_awarded: 0,
      completed_by: null,
    });
    await bumpLedger(quest, -1);

    const week = weekKey();
    const bosses = await base44.entities.DailyQuest.filter(
      { launch_quest_id: quest.id, record_type: 'boss', week_key: week },
      '-created_date',
      5
    );
    const boss = (bosses || []).find((b) => (b.completed_by || {}).prospect_id === undone.prospect_id);
    if (boss) {
      await base44.entities.DailyQuest.delete(boss.id);
      await bumpLedger(quest, -2);
    }
    return true;
  } catch (e) {
    console.warn('[dailyQuest] undo skipped: ' + String((e && e.message) || e));
    return null;
  }
}

// Prep missions have no underlying pipeline record — the explicit tap IS
// the self-attested planning action (same as existing side quests).
export async function completePrepDaily(quest) {
  return settleDailyQuest(quest, { kind: 'prep' });
}

// Streak — consecutive LOCAL days with a completed daily quest, with
// rest-day protection: a single missed day never breaks the run.
export function computeDailyStreak(dailies, today = localDateStr()) {
  const done = new Set((dailies || []).filter((r) => r.status === 'completed').map((r) => r.date));
  let cursor = done.has(today) ? today : dayBefore(today);
  if (!done.has(cursor)) return 0;
  let streak = 0;
  let restUsed = false;
  while (done.has(cursor)) {
    streak += 1;
    const prev = dayBefore(cursor);
    if (done.has(prev)) cursor = prev;
    else if (!restUsed && done.has(dayBefore(prev))) {
      restUsed = true; // one forgiven rest day per run
      cursor = dayBefore(prev);
    } else break;
  }
  return streak;
}

// Loads (and persists) today's assignment. The mission is chosen once per
// local day and then PERSISTS — but if it became impossible (its contact
// declined), it re-derives from the current pipeline. Never fabricates.
export async function loadDailyQuestState(quest, prospects) {
  const today = localDateStr();
  const week = weekKey();
  const all = await base44.entities.DailyQuest.filter({ launch_quest_id: quest.id }, '-created_date', 200);
  const dailies = (all || []).filter((r) => r.record_type === 'daily');

  let row = dailies.find((r) => r.date === today) || null;
  if (!row) {
    // Transitional honesty: the legacy Grow daily quest may already have
    // paid +25 for today — pre-complete the row so today can never pay twice.
    let preCompleted = false;
    try {
      const states = await base44.entities.GrowState.filter({ launch_quest_id: quest.id }, '-created_date', 5);
      preCompleted = ((states || [])[0] || {}).daily_quest_completed_date === today;
    } catch (e) {
      // row stays active — nothing is fabricated
    }
    row = await base44.entities.DailyQuest.create({
      user_id: quest.user_id,
      launch_quest_id: quest.id,
      selected_business_id: quest.selected_business_id,
      record_type: 'daily',
      date: today,
      week_key: week,
      mission_key: pickDailyMission(prospects),
      status: preCompleted ? 'completed' : 'active',
      completed_at: preCompleted ? new Date().toISOString() : null,
      xp_awarded: preCompleted ? DAILY_XP : 0,
    });
  } else if (row.status === 'active' && !dailyActionTarget(row.mission_key, prospects)) {
    const rekey = pickDailyMission(prospects);
    if (rekey !== row.mission_key) {
      row = await base44.entities.DailyQuest.update(row.id, { mission_key: rekey });
    }
  }

  const streak = computeDailyStreak(dailies, today);
  const weekDone = dailies.filter((r) => r.week_key === week && r.status === 'completed').length;
  const boss =
    (all || []).find((r) => r.record_type === 'boss' && r.week_key === week && r.status === 'completed') || null;

  return {
    row,
    mission: DAILY_MISSIONS[row.mission_key] || DAILY_MISSIONS.find_prospect,
    completed: row.status === 'completed',
    streak,
    weekDone,
    bossDefeated: !!boss,
  };
}