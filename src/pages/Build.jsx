import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Briefcase, ArrowRight, RotateCcw, Check } from 'lucide-react';
import {
  BUILD_MODULES, loadBuilderState, generateModule, acceptAsset, saveEditedContent,
} from '@/lib/builderService';
import { hasEntitlement, startCheckout, verifyCheckoutSession } from '@/lib/paymentService';
import { useAuth } from '@/lib/AuthContext';
import PaywallCard from '@/components/builder/PaywallCard';
import PurchaseSuccessOverlay from '@/components/builder/PurchaseSuccessOverlay';
import BuilderHeader from '@/components/builder/BuilderHeader';
import ModuleNav from '@/components/builder/ModuleNav';
import ModulePanel from '@/components/builder/ModulePanel';
import GenerationOverlay from '@/components/builder/GenerationOverlay';
import StructuredEditor from '@/components/builder/StructuredEditor';
import AskHustleDrop from '@/components/builder/AskHustleDrop';
import CustomerModule from '@/components/builder/CustomerModule';
import OfferModule from '@/components/builder/OfferModule';
import PricingModule from '@/components/builder/PricingModule';
import BrandModule from '@/components/builder/BrandModule';
import SalesModule from '@/components/builder/SalesModule';
import MarketingModule from '@/components/builder/MarketingModule';

// BUSINESS BUILDER — the six modules that create and approve the business
// (Customer → Marketing). When all six are accepted, the business is BUILT
// and the user advances to LAUNCH MODE. Free during development; the payment
// gate installs later at the single server-side entitlement hook.
const MODULE_DISPLAY = {
  customer: CustomerModule,
  offer: OfferModule,
  pricing: PricingModule,
  brand: BrandModule,
  sales: SalesModule,
  marketing: MarketingModule,
};

export default function Build() {
  const { user } = useAuth();
  const [phase, setPhase] = useState('loading'); // loading | no-selection | paywall | error | ready
  // Payment states: not_started | starting | processing | failed | cancelled | iframe_blocked
  const [payment, setPayment] = useState({ state: 'not_started' });
  const [showUnlocked, setShowUnlocked] = useState(false);
  const [loadKey, setLoadKey] = useState(0);
  const [state, setState] = useState(null);
  const [activeKey, setActiveKey] = useState('customer');
  const [generating, setGenerating] = useState(null);
  const [keeping, setKeeping] = useState(false);
  const [brandPicking, setBrandPicking] = useState(false);
  const [editor, setEditor] = useState(null);
  const [genError, setGenError] = useState(null);

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
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKey, user]);

  // CHECKOUT RETURN — verify with the server before unlocking anything.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const result = urlParams.get('checkout');
    const sessionId = urlParams.get('session_id');
    if (!result) return;
    window.history.replaceState({}, '', '/build');
    if (result === 'success' && sessionId) {
      setPayment({ state: 'starting' });
      (async () => {
        try {
          const res = await verifyCheckoutSession(sessionId);
          if (res.status === 'paid') {
            trackEvent('purchase_completed', { product_key: 'build_my_business' });
            setPayment({ state: 'not_started' });
            setLoadKey((k) => k + 1);
            const seenKey = `hd_unlocked_${sessionId}`;
            if (!sessionStorage.getItem(seenKey)) {
              sessionStorage.setItem(seenKey, '1');
              setShowUnlocked(true);
            }
          } else if (res.status === 'failed') {
            setPayment({ state: 'failed' });
          } else {
            setPayment({ state: 'processing' });
          }
        } catch (e) {
          setPayment({ state: 'processing' });
        }
      })();
    } else if (result === 'cancelled') {
      setPayment({ state: 'cancelled' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const acceptedCount = BUILD_MODULES.filter((m) => byModule[m.key].accepted).length;
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

  const isUnlocked = (idx) => BUILD_MODULES.slice(0, idx).every((m) => byModule[m.key].accepted);

  // REVIEW RECOMMENDED: an upstream accepted version changed after this
  // module was generated. We never auto-regenerate — the user decides.
  const reviewNeeded = (key) => {
    const acc = byModule[key]?.accepted;
    const basedOn = acc?.generation_metadata?.based_on;
    if (!acc || !basedOn) return false;
    return Object.entries(basedOn).some(([dep, id]) => byModule[dep]?.accepted?.id !== id);
  };

  const handleGenerate = async (moduleKey, options = {}, isRegen = false) => {
    if (generating || brandPicking) return;
    setGenerating(moduleKey);
    setGenError(null);
    if (assets.length === 0 && !isRegen) trackEvent('builder_started');
    try {
      const res = await generateModule(moduleKey, options);
      if (res.status === 'ok' && res.asset) {
        setState((prev) => ({ ...prev, assets: [res.asset, ...(prev ? prev.assets || [] : [])] }));
        trackEvent(isRegen ? 'module_regenerated' : 'module_generated', { module_type: moduleKey });
      } else if (res.status === 'payment_required') {
        setPhase('paywall');
      } else if (res.status === 'missing_upstream') {
        setGenError('Accept the previous module first — each module builds on the one before it.');
      } else {
        setGenError(res.error || 'Generation failed — please try again.');
      }
    } catch (e) {
      setGenError('Generation failed — please try again.');
    } finally {
      setGenerating(null);
    }
  };

  const handleKeep = async (asset) => {
    if (keeping) return;
    setKeeping(true);
    try {
      const updated = await acceptAsset(asset, assets.filter((a) => a.module_type === asset.module_type));
      setState((prev) => ({
        ...prev,
        assets: prev.assets.map((a) => {
          if (a.id === updated.id) return updated;
          if (a.module_type === asset.module_type && a.status === 'accepted') return { ...a, status: 'archived' };
          return a;
        }),
      }));
      trackEvent('module_accepted', { module_type: asset.module_type });
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

  // Brand stage 2: the user picked a name from the generated options.
  const handlePickName = async (name) => {
    if (generating || brandPicking) return;
    setBrandPicking(true);
    setGenError(null);
    try {
      const res = await generateModule('brand', { stage: 'identity', selected_name: name });
      if (res.status === 'ok' && res.asset) {
        setState((prev) => ({ ...prev, assets: [res.asset, ...(prev.assets || [])] }));
        trackEvent('module_generated', { module_type: 'brand' });
      } else {
        setGenError(res.error || 'Generation failed — please try again.');
      }
    } catch (e) {
      setGenError('Generation failed — please try again.');
    } finally {
      setBrandPicking(false);
    }
  };

  const actionsFor = (key) => {
    const slot = byModule[key];
    const display = slot.draft || slot.accepted;
    if (key === 'brand' && display && Array.isArray(display.content?.name_options)) return [];
    if (!display) {
      return [{ label: 'GENERATE MODULE', primary: true, onClick: () => handleGenerate(key) }];
    }
    const list = [];
    if (slot.draft) list.push({ label: 'KEEP IT', primary: true, onClick: () => handleKeep(slot.draft) });
    list.push({ label: 'TRY ANOTHER', onClick: () => handleGenerate(key, {}, true) });
    list.push({ label: 'EDIT', onClick: () => setEditor(display) });
    return list;
  };

  // BUILD MY BUSINESS — $19. Double-tap protected; iframe-aware.
  const handleStartCheckout = async () => {
    if (payment.state === 'starting') return;
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
      <div className="mx-auto w-full max-w-2xl space-y-5">
        <PaywallCard
          modelName={state ? state.model.name : 'your business'}
          fit={state ? state.fit : null}
          payment={payment}
          busy={payment.state === 'starting'}
          onStartCheckout={handleStartCheckout}
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
        description="The Business Builder personalizes every module around your selected HustleMatch — your budget, hours, skills and HustleDNA. Pick a business from your results to start building."
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
          <button
            onClick={() => setLoadKey((k) => k + 1)}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        }
      />
    );
  }

  const idx = BUILD_MODULES.findIndex((m) => m.key === activeKey);
  const def = BUILD_MODULES[idx];
  const slot = byModule[activeKey];
  const display = slot.draft || slot.accepted;
  const Display = MODULE_DISPLAY[activeKey];
  const hasNext = idx < BUILD_MODULES.length - 1;
  const editorDef = editor ? BUILD_MODULES.find((m) => m.key === editor.module_type) : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <BuilderHeader
        businessName={state.model.name}
        fit={state.fit}
        hustleCode={state.dna ? state.dna.hustle_code : null}
        percent={percent}
      />

      {allAccepted ? (
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
            You can still revise any module below — Launch Mode uses your accepted versions.
          </p>
        </div>
      ) : null}

      <ModuleNav
        modules={BUILD_MODULES.map((m, i) => ({
          ...m,
          accepted: !!byModule[m.key].accepted,
          locked: !isUnlocked(i),
        }))}
        activeKey={activeKey}
        onSelect={(key) => {
          setActiveKey(key);
          setGenError(null);
          window.scrollTo({ top: 0 });
        }}
      />

      {generating === activeKey ? (
        <GenerationOverlay
          acceptedMap={BUILD_MODULES.map((m) => !!byModule[m.key].accepted)}
          activeIndex={idx}
          label={def.label}
        />
      ) : (
        <ModulePanel
          num={def.num}
          label={def.label}
          desc={def.desc}
          status={slot.accepted && !slot.draft ? 'accepted' : display ? 'draft' : 'empty'}
          reviewNeeded={reviewNeeded(activeKey)}
          actions={actionsFor(activeKey)}
        >
          {display ? (
            activeKey === 'brand' ? (
              <BrandModule
                content={display.content}
                onPickName={handlePickName}
                onTryNames={() => handleGenerate('brand', {}, true)}
                picking={brandPicking}
              />
            ) : (
              <Display content={display.content} />
            )
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Not generated yet. This module uses one AI request built from your real data — nothing else is
              regenerated when it changes.
            </p>
          )}
          {genError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-foreground/90">
              {genError}
            </p>
          )}
        </ModulePanel>
      )}

      {slot.accepted && hasNext && (
        <button
          onClick={() => {
            setActiveKey(BUILD_MODULES[idx + 1].key);
            setGenError(null);
            window.scrollTo({ top: 0 });
          }}
          className="w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
        >
          NEXT: {BUILD_MODULES[idx + 1].label}
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
          title={editorDef ? `${editorDef.num} ${editorDef.label} — EDIT` : 'EDIT'}
          content={editor.content}
          onClose={() => setEditor(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}