import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Briefcase, ArrowRight, RotateCcw, Check } from 'lucide-react';
import {
  BUILD_MODULES, loadBuilderState, generateModule, acceptAsset, saveEditedContent, createManualBrandAsset,
  createManualMarketingAsset,
} from '@/lib/builderService';
import { hasEntitlement, startCheckout, verifyCheckoutWithRetry } from '@/lib/paymentService';
import { useAuth } from '@/lib/AuthContext';
import PaywallCard from '@/components/builder/PaywallCard';
import PurchaseSuccessOverlay from '@/components/builder/PurchaseSuccessOverlay';
import GenerationOverlay from '@/components/builder/GenerationOverlay';
import StructuredEditor from '@/components/builder/StructuredEditor';
import AskHustleDrop from '@/components/builder/AskHustleDrop';
import BuilderHUD from '@/components/builder/BuilderHUD';
import MissionMap from '@/components/builder/MissionMap';
import MissionShell from '@/components/builder/missions/MissionShell';
import { MISSION_META } from '@/components/builder/missions/missionMeta';
import CustomerMission from '@/components/builder/missions/CustomerMission';
import OfferMission from '@/components/builder/missions/OfferMission';
import PricingMission from '@/components/builder/missions/PricingMission';
import BrandMission from '@/components/builder/missions/BrandMission';
import SalesMission from '@/components/builder/missions/SalesMission';
import MarketingMission from '@/components/builder/missions/MarketingMission';

// BUSINESS BUILDER — six interactive missions (FIND YOUR CROWD → LAUNCH YOUR
// CAMPAIGN). Each mission has its own interaction and its own confirm action;
// acceptance still goes through the same GeneratedAsset persistence (accept =
// idempotent per mission, previous versions archived, never overwritten).
// XP is derived from accepted missions — one award per mission by design.
const MISSION_COMPONENTS = {
  customer: CustomerMission,
  offer: OfferMission,
  pricing: PricingMission,
  brand: BrandMission,
  sales: SalesMission,
  marketing: MarketingMission,
};

export default function Build() {
  const { user } = useAuth();
  const [phase, setPhase] = useState('loading'); // loading | no-selection | paywall | error | ready
  // Payment states: not_started | starting | verifying | processing | failed | cancelled | iframe_blocked
  const [payment, setPayment] = useState({ state: 'not_started' });
  const [verifyingSession, setVerifyingSession] = useState(null);
  const [verifyAttempt, setVerifyAttempt] = useState(0);
  const [showUnlocked, setShowUnlocked] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [state, setState] = useState(null);
  const [activeKey, setActiveKey] = useState('customer');
  const [generating, setGenerating] = useState(null);
  const [keeping, setKeeping] = useState(false);
  const [brandPicking, setBrandPicking] = useState(false);
  const [manualBusy, setManualBusy] = useState(false);
  const [editor, setEditor] = useState(null);
  const [genError, setGenError] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [celebrate, setCelebrate] = useState(null); // mission key that just completed

  // Persistent character sprite for the HUD (cosmetic only).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        if (!cancelled && me && me.selected_avatar_id) {
          setAvatar(await base44.entities.Avatar.get(me.selected_avatar_id));
        }
      } catch (e) {
        // cosmetic — the labelled fallback slot covers it
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setPhase('loading');
    (async () => {
      try {
        const s = await loadBuilderState();
        if (cancelled) return;
        if (!s.selection) {
          setPhase('no-selection');
          return;
        }
        // PAYMENT GATE: without a verified entitlement, show the paywall —
        // the server independently blocks generation (payment_required).
        if (user?.role !== 'admin') {
          const entitled = await hasEntitlement(s.selection.id);
          if (!entitled) {
            if (!cancelled) {
              setState(s);
              setPhase('paywall');
            }
            return;
          }
        }
        setState(s);
        const firstIncomplete = BUILD_MODULES.find(
          (m) => !(s.assets || []).some((a) => a.module_type === m.key && a.status === 'accepted')
        );
        setActiveKey((firstIncomplete || BUILD_MODULES[BUILD_MODULES.length - 1]).key);
        setPhase('ready');
      } catch (e) {
        console.error('[Build] init failed', e);
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKey, user]);

  // CHECKOUT RETURN — never trust the success URL: the session id is sent to
  // the server, which re-checks with Stripe and fulfills idempotently.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get('checkout');
    const sessionId = urlParams.get('session_id');
    if (!result) return;
    window.history.replaceState({}, '', '/build');
    if (result === 'success' && sessionId) {
      setVerifyingSession(sessionId);
    } else if (result === 'cancelled') {
      setPayment({ state: 'cancelled' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // VERIFICATION — bounded-backoff retries while Stripe still reports
  // processing; CHECK AGAIN re-runs it. While a confirmed payment is being
  // reconciled, no new purchase CTA is shown.
  useEffect(() => {
    if (!verifyingSession) return undefined;
    let cancelled = false;
    (async () => {
      setPayment({ state: 'verifying' });
      try {
        const res = await verifyCheckoutWithRetry(verifyingSession);
        if (cancelled) return;
        if (res.status === 'paid') {
          trackEvent('purchase_completed', { product_key: 'build_my_business' });
          setPayment({ state: 'not_started' });
          setLoadKey((k) => k + 1);
          const seenKey = `hd_unlocked_${verifyingSession}`;
          if (!sessionStorage.getItem(seenKey)) {
            sessionStorage.setItem(seenKey, '1');
            setShowUnlocked(true);
          }
          setVerifyingSession(null);
        } else if (res.status === 'failed') {
          setPayment({ state: 'failed' });
          setVerifyingSession(null);
        } else {
          setPayment({ state: 'processing' });
        }
      } catch (e) {
        if (!cancelled) setPayment({ state: 'processing' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [verifyingSession, verifyAttempt]);

  const assets = useMemo(() => (state ? state.assets || [] : []), [state]);

  const byModule = useMemo(() => {
    const map = {};
    for (const m of BUILD_MODULES) map[m.key] = { draft: null, accepted: null };
    for (const a of assets) {
      const slot = map[a.module_type];
      if (!slot) continue;
      if (a.status === 'draft') {
        if (!slot.draft || a.version > slot.draft.version) slot.draft = a;
      } else if (a.status === 'accepted') {
        if (!slot.accepted || a.version > slot.accepted.version) slot.accepted = a;
      }
    }
    return map;
  }, [assets]);

  const acceptedKeys = BUILD_MODULES.filter((m) => byModule[m.key].accepted).map((m) => m.key);
  const acceptedCount = acceptedKeys.length;
  const percent = Math.round((acceptedCount / BUILD_MODULES.length) * 100);
  const allAccepted = acceptedCount === BUILD_MODULES.length;

  // Fire build_completed once per session when the whole builder is done.
  const buildDoneRef = useRef(false);
  useEffect(() => {
    if (allAccepted && !buildDoneRef.current) {
      buildDoneRef.current = true;
      trackEvent('build_completed');
    }
  }, [allAccepted]);

  // Subtle mission-complete celebration clears itself.
  useEffect(() => {
    if (!celebrate) return undefined;
    const t = setTimeout(() => setCelebrate(null), 2400);
    return () => clearTimeout(t);
  }, [celebrate]);

  const isUnlocked = (idx) => BUILD_MODULES.slice(0, idx).every((m) => byModule[m.key].accepted);

  // REVIEW RECOMMENDED: an upstream accepted version changed after this
  // mission was generated. We never auto-regenerate — the user decides.
  const reviewNeeded = (key) => {
    const acc = byModule[key]?.accepted;
    const basedOn = acc?.generation_metadata?.based_on;
    if (!acc || !basedOn) return false;
    return Object.entries(basedOn).some(([dep, id]) => byModule[dep]?.accepted?.id !== id);
  };

  // A failed call persists nothing server-side, so one silent retry can never
  // duplicate or overwrite content — bounded to a single attempt.
  const safeGenerate = async (moduleKey, options) => {
    try {
      return await generateModule(moduleKey, options);
    } catch (e) {
      // Surface the server's own error text (500s carry a message) instead of
      // a generic "request failed" — nothing was saved either way.
      return { status: 'client_error', error: (e && e.message) || 'request failed' };
    }
  };

  const runGeneration = async (moduleKey, options) => {
    let res = await safeGenerate(moduleKey, options);
    // Retry ONCE, and only for transient failures — client_error (network or
    // invocation failure) or a server-reported transient LLM error. Permanent
    // generation errors never auto-retry.
    if (
      res &&
      (res.status === 'client_error' ||
        (res.status === 'generation_error' && res.transient !== false))
    ) {
      await new Promise((r) => setTimeout(r, 800));
      res = await safeGenerate(moduleKey, options);
    }
    return res;
  };

  const handleGenerate = async (moduleKey, options = {}, isRegen = false) => {
    if (generating || brandPicking) return;
    setGenerating(moduleKey);
    setGenError(null);
    if (assets.length === 0 && !isRegen) trackEvent('builder_started');
    try {
      const res = await runGeneration(moduleKey, options);
      if (res && res.status === 'ok' && res.asset) {
        setState((prev) => ({ ...prev, assets: [res.asset, ...(prev ? prev.assets || [] : [])] }));
        trackEvent(isRegen ? 'module_regenerated' : 'module_generated', { module_type: moduleKey });
      } else if (res && res.status === 'payment_required') {
        setPhase('paywall');
      } else if (res && res.status === 'missing_upstream') {
        setGenError('Lock in the previous mission first — each mission builds on the one before it.');
      } else {
        // Never claims success — nothing was saved on failure.
        setGenError(
          `AI drafting failed twice${res && res.error ? ` (${res.error})` : ''} — nothing was saved. Try again in a moment.`
        );
      }
    } finally {
      setGenerating(null);
    }
  };

  // MISSION CONFIRM — every mission's distinct confirm action funnels here.
  // An optional patch (the user's selection) is written into the DRAFT only;
  // acceptance then persists one idempotent accepted version per mission.
  // Accepted versions are archived, never overwritten.
  const confirmMission = async (moduleKey, patch) => {
    if (keeping) return;
    const slot = byModule[moduleKey];
    const asset = slot.draft || slot.accepted;
    if (!asset) return;
    setKeeping(true);
    try {
      let target = asset;
      if (patch) {
        const { asset: saved } = await saveEditedContent(
          asset,
          assets.filter((a) => a.module_type === moduleKey),
          { ...asset.content, ...patch }
        );
        target = saved;
      }
      const updated = await acceptAsset(target, assets.filter((a) => a.module_type === moduleKey));
      setState((prev) => {
        const others = prev.assets.filter((a) => a.id !== updated.id);
        const archived = others.map((a) =>
          a.module_type === moduleKey && a.status === 'accepted' ? { ...a, status: 'archived' } : a
        );
        return { ...prev, assets: [updated, ...archived] };
      });
      trackEvent('module_accepted', { module_type: moduleKey });
      setCelebrate(moduleKey);
    } catch (e) {
      setGenError('Could not save your choice — please try again.');
    } finally {
      setKeeping(false);
    }
  };

  const handleEditSave = async (content) => {
    const asset = editor;
    if (!asset) return;
    try {
      const { asset: saved, created } = await saveEditedContent(
        asset,
        assets.filter((a) => a.module_type === asset.module_type),
        content
      );
      setState((prev) => ({
        ...prev,
        assets: created ? [saved, ...prev.assets] : prev.assets.map((a) => (a.id === saved.id ? saved : a)),
      }));
      trackEvent('module_edited', { module_type: asset.module_type });
      setEditor(null);
    } catch (e) {
      setGenError('Could not save your edits — please try again.');
    }
  };

  // Brand stage 2: the user confirmed a name from the generated options.
  const handlePickName = async (name) => {
    if (generating || brandPicking) return;
    setBrandPicking(true);
    setGenError(null);
    try {
      const res = await runGeneration('brand', { stage: 'identity', selected_name: name });
      if (res && res.status === 'ok' && res.asset) {
        setState((prev) => ({ ...prev, assets: [res.asset, ...(prev.assets || [])] }));
        trackEvent('module_generated', { module_type: 'brand' });
      } else {
        setGenError(
          `Forging your identity failed${res && res.error ? ` (${res.error})` : ''} — nothing was saved. Try again, or save your name only.`
        );
      }
    } finally {
      setBrandPicking(false);
    }
  };

  // MANUAL FALLBACK — when AI drafting is unavailable the user can save their
  // own business name as a plain draft they explicitly accept. It is never
  // marked as AI-generated and never claims a generated brand kit.
  const handleManualBrandName = async (name) => {
    if (generating || brandPicking || !state || !state.selection) return;
    setBrandPicking(true);
    setGenError(null);
    try {
      const asset = await createManualBrandAsset(user && user.id, state.selection.id, name);
      setState((prev) => ({ ...prev, assets: [asset, ...(prev.assets || [])] }));
      trackEvent('brand_name_entered_manually');
    } catch (e) {
      setGenError('Could not save your name — please try again.');
    } finally {
      setBrandPicking(false);
    }
  };

  // MANUAL CAMPAIGN FALLBACK — the user builds their own mission 06 from
  // their accepted material when the AI kit is unavailable. Plain draft,
  // explicitly labelled, explicitly accepted.
  const handleManualCampaign = async (values) => {
    if (generating || manualBusy || !state || !state.selection) return;
    setManualBusy(true);
    setGenError(null);
    try {
      const asset = await createManualMarketingAsset(user && user.id, state.selection.id, values);
      setState((prev) => ({ ...prev, assets: [asset, ...(prev.assets || [])] }));
      trackEvent('marketing_campaign_entered_manually');
    } catch (e) {
      setGenError('Could not save your campaign — please try again.');
    } finally {
      setManualBusy(false);
    }
  };

  // BUILD MY BUSINESS — $19. Double-tap protected; iframe-aware. Never while
  // a payment is being verified or reconciled.
  const handleStartCheckout = async () => {
    if (payment.state === 'starting' || payment.state === 'verifying' || payment.state === 'processing') return;
    setPayment({ state: 'starting' });
    try {
      const res = await startCheckout();
      if (res.status === 'already_entitled') {
        setPayment({ state: 'not_started' });
        setLoadKey((k) => k + 1);
      } else if (res.status === 'checkout_started' && res.url) {
        trackEvent('checkout_started', { product_key: 'build_my_business' });
        window.location.href = res.url;
        return;
      } else if (res.status === 'iframe_blocked') {
        setPayment({ state: 'iframe_blocked' });
      } else {
        setPayment({ state: 'failed' });
      }
    } catch (e) {
      setPayment({ state: 'failed' });
    }
  };

  if (phase === 'paywall') {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <PaywallCard
          modelName={state ? state.model.name : 'your business'}
          fit={state ? state.fit : null}
          dna={state ? state.dna : null}
          payment={payment}
          busy={payment.state === 'starting'}
          onStartCheckout={handleStartCheckout}
          onRetryVerify={() => setVerifyAttempt((a) => a + 1)}
        />
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (phase === 'no-selection') {
    return (
      <EmptyState
        icon={Briefcase}
        title="Choose a business first"
        description="The Business Builder personalizes every mission around your selected HustleMatch — your budget, hours, skills and HustleDNA. Pick a business from your results to start your quest."
        action={
          <Link
            to="/results"
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            VIEW MY MATCHES
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
    );
  }

  if (phase === 'error') {
    return (
      <EmptyState
        icon={RotateCcw}
        title="Business Builder unavailable right now"
        description="We couldn't load your builder data. Nothing was lost — you can safely try again."
        action={
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => setLoadKey((k) => k + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-foreground/85 transition hover:border-white/30"
            >
              BACK TO DASHBOARD
            </Link>
          </div>
        }
      />
    );
  }

  const idx = BUILD_MODULES.findIndex((m) => m.key === activeKey);
  const meta = MISSION_META[activeKey];
  const slot = byModule[activeKey];
  const Mission = MISSION_COMPONENTS[activeKey];
  const editorDef = editor ? BUILD_MODULES.find((m) => m.key === editor.module_type) : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      <BuilderHUD
        businessName={state.model.name}
        fit={state.fit}
        dna={state.dna}
        avatar={avatar}
        acceptedKeys={acceptedKeys}
      />

      <MissionMap
        modules={BUILD_MODULES.map((m, i) => ({
          ...m,
          accepted: !!byModule[m.key].accepted,
          locked: !isUnlocked(i),
          active: activeKey === m.key,
        }))}
        onSelect={(key) => {
          setActiveKey(key);
          setGenError(null);
          window.scrollTo({ top: 0 });
        }}
      />

      {allAccepted && (
        <div className="rounded-2xl border-2 border-primary/40 bg-brand-gradient-soft p-6 text-center">
          <div className="text-xs font-semibold tracking-[0.25em] text-primary">BUSINESS BUILT</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {state.model.name} is ready to test.
          </h2>
          <div className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2 text-left sm:grid-cols-3">
            {BUILD_MODULES.map((m) => (
              <div key={m.key} className="flex items-center gap-1.5 text-xs text-foreground/90">
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                {m.label}
              </div>
            ))}
          </div>
          <Link
            to="/launch"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            LAUNCH MY BUSINESS
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-[11px] text-muted-foreground">
            You can still revise any mission below — Launch Mode uses your locked-in versions.
          </p>
        </div>
      )}

      {generating === activeKey ? (
        <GenerationOverlay
          acceptedMap={BUILD_MODULES.map((m) => !!byModule[m.key].accepted)}
          activeIndex={idx}
          label={meta.title}
        />
      ) : (
        <MissionShell
          num={meta.num}
          title={meta.title}
          objective={meta.objective}
          status={slot.accepted && !slot.draft ? 'accepted' : slot.draft ? 'draft' : 'empty'}
          reviewNeeded={reviewNeeded(activeKey)}
          justAccepted={celebrate === activeKey}
          onRegenerate={
            activeKey === 'sales'
              ? null
              : slot.draft || slot.accepted
                ? () => handleGenerate(activeKey, {}, true)
                : null
          }
          onEdit={slot.draft || slot.accepted ? () => setEditor(slot.draft || slot.accepted) : null}
          regenerating={generating === activeKey}
        >
          <Mission
            content={(slot.draft || slot.accepted)?.content || null}
            accepted={!!slot.accepted && !slot.draft}
            model={state.model}
            busy={keeping}
            generating={generating === activeKey}
            brandPicking={brandPicking}
            onGenerate={(opts) => handleGenerate(activeKey, opts || {})}
            onConfirm={(patch) => confirmMission(activeKey, patch)}
            onPickName={handlePickName}
            onManualName={handleManualBrandName}
            onManualCampaign={handleManualCampaign}
            manualBusy={manualBusy}
          />
        </MissionShell>
      )}

      {genError && (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-foreground/90">
          {genError}
        </p>
      )}

      {slot.accepted && idx < BUILD_MODULES.length - 1 && (
        <button
          onClick={() => {
            setActiveKey(BUILD_MODULES[idx + 1].key);
            setGenError(null);
            window.scrollTo({ top: 0 });
          }}
          className="w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
        >
          NEXT MISSION: {MISSION_META[BUILD_MODULES[idx + 1].key].title}
        </button>
      )}

      <AskHustleDrop onUsed={() => trackEvent('ask_hustledrop_used')} />

      {showUnlocked && state && (
        <PurchaseSuccessOverlay
          businessName={state.model.name}
          onStart={() => {
            setShowUnlocked(false);
            setActiveKey('customer');
            window.scrollTo({ top: 0 });
          }}
          onLater={() => setShowUnlocked(false)}
        />
      )}

      {editor && (
        <StructuredEditor
          open
          title={`${MISSION_META[editor.module_type].num} ${MISSION_META[editor.module_type].title} — REFINE`}
          content={editor.content}
          onClose={() => setEditor(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}