import { base44 } from '@/api/base44Client';

const STORAGE_KEY = 'hustledrop_quiz_v1';

export function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.session_id) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    // storage unavailable — in-memory progress still works for the session
  }
}

export function newSession() {
  return {
    session_id: generateSessionId(),
    answers: {},
    record_ids: {},
    started_at: new Date().toISOString(),
  };
}

export function updateAnswer(session, key, value) {
  const next = {
    ...session,
    answers: { ...session.answers, [key]: value },
    record_ids: { ...(session.record_ids || {}) },
    updated_at: new Date().toISOString(),
  };
  saveSession(next);
  return next;
}

// Server sync — only callable for authenticated users (QuizResponse create/update is owner-gated).
// Returns the record id for the question, so the caller can update it on later edits.
export async function syncResponseToServer(session, questionKey, answer, userId) {
  const existingId = (session.record_ids || {})[questionKey];
  const payload = { session_id: session.session_id, question_key: questionKey, answer };
  if (userId) payload.user_id = userId;
  if (existingId) {
    await base44.entities.QuizResponse.update(existingId, payload);
    return existingId;
  }
  const record = await base44.entities.QuizResponse.create(payload);
  return record.id;
}

// Restore the latest session's answers from the server (cross-device resume for signed-in users).
export async function fetchServerResponses() {
  const records = await base44.entities.QuizResponse.list('-created_date', 100);
  if (!records || records.length === 0) return null;
  const latestSessionId = records[0].session_id;
  const sessionRecords = records.filter((r) => r.session_id === latestSessionId);
  const answers = {};
  const record_ids = {};
  for (const r of sessionRecords) {
    if (!(r.question_key in answers)) {
      answers[r.question_key] = r.answer;
      record_ids[r.question_key] = r.id;
    }
  }
  return { session_id: latestSessionId, answers, record_ids };
}

// Create or update the signed-in user's single HustleProfile.
export async function saveHustleProfile(profile) {
  const existing = await base44.entities.HustleProfile.list('-created_date', 1);
  if (existing && existing.length > 0) {
    return base44.entities.HustleProfile.update(existing[0].id, profile);
  }
  return base44.entities.HustleProfile.create(profile);
}