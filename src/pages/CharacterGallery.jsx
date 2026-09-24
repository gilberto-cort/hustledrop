import React, { useEffect, useState } from 'react';
import { RotateCcw, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EmptyState from '@/components/EmptyState';
import CharacterCard from '@/components/gallery/CharacterCard';
import CharacterDetailDialog from '@/components/gallery/CharacterDetailDialog';
import { TYPE_ORDER, DNA_TYPES } from '@/lib/dnaDisplay';

// CHARACTER GALLERY — every user can browse ALL 12 characters (six original
// archetypes × masculine/feminine), regardless of selected avatar, HustleDNA
// result or unlock status. Strictly view-only: no automatic selection,
// unlocking or progression side effects — selection stays on HustleDNA.

// Example hustle categories per archetype = families of the existing
// BusinessModel records whose compatible_dna_primary includes the archetype.
function categoriesFor(models, type) {
  const fams = [];
  for (const m of models || []) {
    if (
      Array.isArray(m.compatible_dna_primary) &&
      m.compatible_dna_primary.includes(type) &&
      m.family &&
      !fams.includes(m.family)
    ) {
      fams.push(m.family);
    }
  }
  return fams.slice(0, 5);
}

const byPresentation = (a, b) =>
  (a.presentation === 'masculine' ? 0 : 1) - (b.presentation === 'masculine' ? 0 : 1);

export default function CharacterGallery() {
  const [phase, setPhase] = useState('loading');
  const [avatars, setAvatars] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [rows, modelRows, me] = await Promise.all([
          base44.entities.Avatar.list('display_name', 100),
          base44.entities.BusinessModel.list('name', 200),
          base44.auth.me().catch(() => null),
        ]);
        setAvatars(rows || []);
        setModels(modelRows || []);
        setSelectedAvatarId(me?.selected_avatar_id || null);
        setPhase('ready');
      } catch (e) {
        console.error('[CharacterGallery] load failed', e);
        setPhase('error');
      }
    })();
  }, [loadKey]);

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <EmptyState
        icon={Users}
        title="The character gallery couldn't be loaded right now"
        description="Nothing was lost — this looks like a temporary connection problem. Try again."
        action={
          <button
            onClick={() => {
              setPhase('loading');
              setLoadKey((k) => k + 1);
            }}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-2 text-sm font-semibold text-white"
          >
            <RotateCcw className="h-4 w-4" />
            RETRY
          </button>
        }
      />
    );
  }

  const categories = {};
  for (const t of TYPE_ORDER) categories[t] = categoriesFor(models, t);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <div className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">CHARACTER GALLERY</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">All twelve HustleDrop characters</h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Browse every archetype and its masculine and feminine variants. Viewing a character never changes your
          selection or unlocks anything.
        </p>
      </div>

      {TYPE_ORDER.map((t) => {
        const meta = DNA_TYPES[t] || {};
        const list = avatars.filter((a) => a.dna_type === t && a.active !== false).sort(byPresentation);
        return (
          <section key={t}>
            <h2 className="font-mono text-sm font-bold tracking-widest text-foreground">{meta.label}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{meta.core}</p>
            <div className="mt-3 grid grid-cols-2 gap-4">
              {list.map((a) => (
                <CharacterCard
                  key={a.id}
                  avatar={a}
                  selected={a.id === selectedAvatarId}
                  onOpen={(av) => setDetail({ type: av.dna_type, presentation: av.presentation })}
                />
              ))}
            </div>
          </section>
        );
      })}

      {detail && (
        <CharacterDetailDialog
          key={`${detail.type}-${detail.presentation}`}
          type={detail.type}
          presentation={detail.presentation}
          avatars={avatars}
          selectedAvatarId={selectedAvatarId}
          categories={categories}
          onOpenChange={(open) => {
            if (!open) setDetail(null);
          }}
        />
      )}
    </div>
  );
}