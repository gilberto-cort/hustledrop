# NEON HUSTLE — Asset Specification & Upload Guide

Externally produced 16-bit pixel-art assets. Nothing activates until the
files are uploaded AND the two flags below are flipped — until then the app
keeps rendering its current artwork everywhere.

## Style standard

- **Shared reference:** the approved **Digital Builder** sprite defines
  proportions, pixel density, outline weight and lighting for the entire set.
- Era: 16-bit RPG (SNES-era), chunky readable pixels, 1px dark outlines.
- Palette: limited per-identity accent (see below) over the app's dark theme.
- **Format: PNG-24, true transparent background** (no dark background fill,
  no drop shadow baked in, no watermark).
- Author each pose at the exact frame size below — the renderer scales only
  in integer multiples, so art must start at the source size.

## 1. Characters — 12 identities × 7 poses = 84 files

Identity key = `<dna_type>_<variant>`:

| Identity key     | Character                                    | Accent   |
|------------------|----------------------------------------------|----------|
| hustler_male / hustler_female          | Street entrepreneur (cap, jacket, phone)   | orange   |
| digital_builder_male / _female         | Tech engineer (hoodie, circuits, laptop)  | cyan     |
| creator_male / creator_female          | Artist (apron, brush, palette)            | fuchsia  |
| connector_male / connector_female      | Networker (blazer, wave)                  | gold     |
| operator_male / operator_female        | Organizer (glasses, vest, clipboard)      | green    |
| builder_male / builder_female          | Craftsperson (hard hat, tool belt)        | slate    |

Male and female variants of one identity share the same silhouette family,
outfit concept and accent — distinct face, hairstyle and presentation.

Poses per identity:

| Pose        | Frame size | Notes                                      |
|-------------|------------|--------------------------------------------|
| portrait    | 96×96      | Head-and-shoulders, used for profile cards |
| idle        | 48×48      | Neutral standing, subtle CSS bob applied   |
| walk_up     | 48×48      | Back/walking away                          |
| walk_down   | 48×48      | Front/walking toward viewer                |
| walk_left   | 48×48      | Side profile facing left                   |
| walk_right  | 48×48      | Side profile facing right                  |
| victory     | 48×48      | Celebration pose                           |

**Upload location (exact paths):**

```
public/assets/characters/<identity_key>/<pose>.png
```

Example: `public/assets/characters/hustler_female/victory.png`

**Activation:** after all 84 files exist, set
`MANIFEST_ACTIVE = true` in `src/lib/characterAssets.js`.
The entire app (DNA, Match, Build, Launch, Grow) switches to the library
through the shared SpriteDisplay → CharacterSprite path; the artwork stored
on each Avatar record remains the automatic fallback for any missing slot.

## 2. City districts — 5 districts × 3 states = 15 files

District keys: `crossroads`, `opportunity_alley`, `founders_row`,
`neon_district`, `skyline_heights`.

| File            | Size    | Notes                                        |
|-----------------|---------|----------------------------------------------|
| locked.png      | 512×512 | Isometric district tile, unlit/dim variant  |
| available.png   | 512×512 | Same tile, lit "open for business" variant   |
| completed.png   | 512×512 | Same tile, celebratory/fully-lit variant     |

**Upload location (exact paths):**

```
public/assets/city/<district_key>/<state>.png
```

**Activation:** after the 15 tiles exist, set
`CITY_ASSETS_ACTIVE = true` in `src/components/city/districtManifest.js`.
Tiles render inside rotated 48px diamond frames, so keep key art centered
with safe margins. `CityMap` is built but deliberately **not mounted on any
route yet** — mounting it is a separate, explicit step after artwork lands.

## District states (existing behavior — nothing new invented)

`deriveDistrictStates()` in `src/components/city/districtManifest.js` reads
only records the app already persists:

- **Crossroads** — available with a DNA profile, complete once a business is selected
- **Opportunity Alley** — available with a selected business, complete when all six Build missions are accepted
- **Founder's Row** — available when the build is complete, complete at first recorded customer
- **Neon District** — available after the first customer, complete at 5 customers + operating loop
- **Skyline Heights** — available after Grow is complete

## Hard rules (unchanged by this integration)

- No changes to payments, entitlements, accepted missions, XP, quest
  persistence, purchases or user data.
- Character identity always comes from the user's existing Avatar selection
  (`selected_avatar_id` + dna_type + presentation) — never inferred.
- Walk/victory poses and the city map do nothing until real assets exist;
  do not treat animation support as "working" before upload.