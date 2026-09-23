import { useCallback, useEffect, useRef, useState } from 'react';
import { saveBuilderDraft } from '@/lib/builderDraftService';

// Autosave engine for the Business Builder's in-progress UI state (unfinished
// answers, selections, typed text, last mission viewed). One record per
// selected business, kept separate from generated/accepted module content.
//
// Single-flight, latest-wins: only one save is in flight at a time and every
// save sends the CURRENT state, so a slower stale request can never overwrite
// newer edits. Selections save immediately; text callers pass { debounceMs }.
// On failure nothing is discarded — the state stays in memory and retry()
// re-sends the latest version.
export function useBuilderDraft({ selectedBusinessId, userId, record }) {
  const [ui, setUi] = useState({});
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error
  const uiRef = useRef({});
  const recordRef = useRef(null);
  const lastModuleRef = useRef(null);
  const inFlightRef = useRef(false);
  const queuedRef = useRef(false);
  const timerRef = useRef(null);
  const idRef = useRef(selectedBusinessId);
  idRef.current = selectedBusinessId;
  const userRef = useRef(userId);
  userRef.current = userId;

  // Hydrate from the loaded record DURING render (the documented
  // adjust-state-during-render pattern) so missions mounting in this same
  // commit already see their saved answers.
  const [hydrated, setHydrated] = useState(false);
  if (record && !hydrated) {
    setHydrated(true);
    recordRef.current = record;
    uiRef.current = record.ui || {};
    lastModuleRef.current = record.last_module || null;
    setUi(record.ui || {});
  }

  const flush = useCallback(async () => {
    if (!idRef.current || inFlightRef.current) {
      queuedRef.current = true;
      return;
    }
    inFlightRef.current = true;
    setSaveState('saving');
    try {
      recordRef.current = await saveBuilderDraft(recordRef.current, idRef.current, userRef.current, {
        ui: uiRef.current,
        last_module: lastModuleRef.current,
      });
      setSaveState('saved');
    } catch (e) {
      setSaveState('error');
    } finally {
      inFlightRef.current = false;
      if (queuedRef.current) {
        queuedRef.current = false;
        flush();
      }
    }
  }, []);

  const updateUi = useCallback(
    (moduleKey, patch, opts = {}) => {
      const next = { ...uiRef.current, [moduleKey]: { ...(uiRef.current[moduleKey] || {}), ...patch } };
      uiRef.current = next;
      setUi(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      const wait = opts.debounceMs || 0;
      if (wait > 0) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          flush();
        }, wait);
      } else {
        flush();
      }
    },
    [flush]
  );

  const clearUi = useCallback(
    (moduleKey) => {
      if (!(moduleKey in uiRef.current)) return;
      const next = { ...uiRef.current };
      delete next[moduleKey];
      uiRef.current = next;
      setUi(next);
      flush();
    },
    [flush]
  );

  const setLastModule = useCallback(
    (moduleKey) => {
      if (lastModuleRef.current === moduleKey) return;
      lastModuleRef.current = moduleKey;
      flush();
    },
    [flush]
  );

  // Navigating away mid-edit still persists the pending debounced change.
  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        flush();
      }
    },
    [flush]
  );

  return { getUi: (key) => ui[key] || null, updateUi, clearUi, setLastModule, saveState, retry: flush };
}