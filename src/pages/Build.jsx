import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from '@/lib/analytics';
import EmptyState from '@/components/EmptyState';
import { Briefcase, ArrowRight, RotateCcw } from 'lucide-react';
import {
  BUILDER_MODULES, loadBuilderState, generateModule, acceptAsset, saveEditedContent,
} from '@/lib/builderService';
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
import LaunchModule from '@/components/builder/LaunchModule';

// BUSINESS BUILDER V1 — free during development (payment gate installs later
// at the single server-side entitlement hook). Seven modules generated one
// AI request at a time; deterministic software owns all user data, progress
// and saved choices.
const MODULE_DISPLAY = {
  customer: CustomerModule,
  offer: OfferModule,
  pricing: PricingModule,
  brand: BrandModule,
  sales: SalesModule,
  marketing: MarketingModule,
  launch: LaunchModule,
};

export default function Build() {
  const [phase, setPhase] = useState('loading'); // loading | no-selection | error | ready
  const [loadKey, setLoadKey] = useState(0);
  const [state, setState] = useState(null);
  const [activeKey, setActiveKey] = useState('customer');
  const [generating, setGenerating] = useState(null);
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
        setState(s);
        const firstIncomplete = BUILDER_MODULES.find(
          (m) => !(s.assets || []).some((a) => a.module_type === m.key && a.status === 'accepted')
        );
        setActiveKey((firstIncomplete || BUILDER_MODULES[BUILDER_MODULES.length - 1]).key);
        setPhase('ready');
      } catch (e) {
        if (!cancelled) setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  const assets = useMemo(() => (state ? state.assets || [] : []), [state]);

  const byModule = useMemo(() => {
    const map = {};
    for (const m of BUILDER_MODULES) map[m.key] = { draft: null, accepted: null };
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

  const acceptedCount = BUILDER_MODULES.filter((m) => byModule[m.key].accepted).length;
  const percent = Math.round((acceptedCount / BUILDER_MODULES.length) * 100);

  const isUnlocked = (idx) => BUILDER_MODULES.slice(0, idx).every((m) => byModule[m.key].accepted);

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
      if (BUILDER_MODULES.every((m) => m.key === asset.module_type || byModule[m.key].accepted)) {
        trackEvent('builder_completed');
      }
    } catch (e) {
      setGenError('Could not save your choice — please try again.');
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

  // Brand stage 2: the user picked a name from the accepted/generated options.
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

  const idx = BUILDER_MODULES.findIndex((m) => m.key === activeKey);
  const def = BUILDER_MODULES[idx];
  const slot = byModule[activeKey];
  const display = slot.draft || slot.accepted;
  const Display = MODULE_DISPLAY[activeKey];
  const hasNext = idx < BUILDER_MODULES.length - 1;
  const editorDef = editor ? BUILDER_MODULES.find((m) => m.key === editor.module_type) : null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5">
      <BuilderHeader
        businessName={state.model.name}
        fit={state.fit}
        hustleCode={state.dna ? state.dna.hustle_code : null}
        percent={percent}
      />

      <ModuleNav
        modules={BUILDER_MODULES.map((m, i) => ({
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
          acceptedMap={BUILDER_MODULES.map((m) => !!byModule[m.key].accepted)}
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
            setActiveKey(BUILDER_MODULES[idx + 1].key);
            setGenError(null);
            window.scrollTo({ top: 0 });
          }}
          className="w-full rounded-full bg-brand-gradient py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
        >
          NEXT: {BUILDER_MODULES[idx + 1].label}
        </button>
      )}

      <AskHustleDrop onUsed={() => trackEvent('ask_hustledrop_used')} />

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