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

## 1. Characters — 12 identities × (7 static poses + 6 animated sheets)

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
public/assets/characters/<identity_key>/<pose>.png         (static poses)
public/assets/characters/<identity_key>/<pose>.sheet.png   (animated sheets)
```

Example: `public/assets/characters/hustler_female/victory.png`,
`public/assets/characters/hustler_male/walk_left.sheet.png`

**Activation:** after all 84 static files exist, set
`MANIFEST_ACTIVE = true` in `src/lib/characterAssets.js`. After all 72
sheets exist, additionally set `MANIFEST_ANIMATIONS_ACTIVE = true` (same
file). Static poses always remain the fallback — a missing or broken sheet
is covered by its static pose, which is covered by the Avatar record's own
artwork.
The entire app (DNA, Match, Build, Launch, Grow) switches to the library
through the shared SpriteDisplay → CharacterSprite path.

### 1a. Animated sprite sheets — 6 per identity

One horizontal strip per animation — **idle, walk_up, walk_down, walk_left,
walk_right, victory**:

| Sheet               | Frames | Frame size | Sheet canvas | Playback |
|---------------------|--------|------------|--------------|----------|
| idle.sheet.png      | 4      | 48×48      | 192×48       | 6 fps    |
| walk_up.sheet.png   | 4      | 48×48      | 192×48       | 8 fps    |
| walk_down.sheet.png | 4      | 48×48      | 192×48       | 8 fps    |
| walk_left.sheet.png | 4      | 48×48      | 192×48       | 8 fps    |
| walk_right.sheet.png| 4      | 48×48      | 192×48       | 8 fps    |
| victory.sheet.png   | 6      | 48×48      | 288×48       | 10 fps   |

Sheet layout & format rules:

- Single row, frames laid out **left-to-right, contiguous** — no gaps,
  padding, margins, labels or frame numbers anywhere on the sheet.
- PNG-24, **true transparent background**; the character stays inside the
  48×48 frame bounds (feet on the frame's bottom edge for idle/walk).
- **Frame 0 of each sheet must match its static pose file** — the app shows
  exactly that frame when animation is off or reduced motion is requested.
- **Seamless loop**: the last frame must flow visually back into frame 0
  (walks cycle contact–pass–contact; victory settles back to frame 0).
- Playback speed above is enforced by the app — sheets carry no timing
  metadata, and duplicate frames must not be used to slow a cycle down.
- Same Digital Builder style standard, outlines, palette and accents as the
  static poses; the character stays visually identical between static and
  sheet.

Total per identity: 7 static poses + 6 animated sheets.
Full set: 84 static files + 72 sheet files = 156 files.

## Delivery status

- **Delivered & active:** `digital_builder_male` and `digital_builder_female` —
  `portrait.png` (96×96, cropped from the approved poster, OPAQUE square),
  `idle.png` (48×48 RGBA prototype) and `idle.sheet.png` (192×48 RGBA,
  4-frame 1px bob, frame 0 == idle.png). `MANIFEST_ACTIVE` is on; every
  other identity and pose still renders its existing Avatar-record artwork.
- **Delivered but NOT playing:** the two idle sheets. Sheets are background
  images whose load failures can't be detected, so
  `MANIFEST_ANIMATIONS_ACTIVE` must stay false until every identity has at
  least the sheets the app uses — otherwise missing sheets render as empty
  slots instead of falling back. Re-check when more packs land.
- **Still missing:** all files for the other 10 identities, plus
  `walk_up/walk_down/walk_left/walk_right/victory` (static + sheet) for
  the two delivered ones.

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