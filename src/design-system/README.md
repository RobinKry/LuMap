# LuMap Design System — drop-in package

Everything here is **plain CSS and plain React**. No build config, no npm
dependencies beyond `react` itself, no Tailwind, no CSS-in-JS library.

```
styles.css              ← the single entry point. Import this once.
tokens/                 ← fonts · colors · typography · spacing · shape · motion
components/             ← 11 React components (.jsx) + .d.ts contracts + .prompt.md notes
reference/lumap-app/    ← a working HTML recreation of the app, for visual reference
DESIGN_GUIDE.md         ← the full brand guide: voice, colour rules, motion, iconography
SKILL.md                ← Agent Skills front-matter, so Cursor/Claude Code can load this
```

## 1. Install

Copy the whole folder into your repo. A common home:

```
src/design-system/
├── styles.css
├── tokens/
└── components/
```

Import the stylesheet **once**, at your app root:

```js
// src/main.jsx  (or _app.tsx, or layout.tsx)
import './design-system/styles.css';
```

`styles.css` is nothing but `@import` lines, so bundlers (Vite, Next, Webpack,
Parcel) inline it automatically. `tokens/fonts.css` pulls Fredoka and Plus Jakarta
Sans from Google Fonts — see "Fonts" below if your app must self-host.

## 2. Set the mode

Every colour resolves from `--accent` and `--surface-canvas`, which are scoped by a
`data-mode` attribute. Put it on a wrapper (or `<html>`):

```jsx
<div data-mode={mode === 'PARTY' ? 'party' : 'work'}>
  <App />
</div>
```

- **No attribute at all → WORK.** The unscoped `:root` block already resolves to
  the WORK palette, so the app is correct on first paint before any JS runs.
- `data-mode="party"` swaps to the lilac / cream palette.

Never hard-code `#77A0F2` or `#8B88F2` in a component. Use `var(--accent)` and the
mode switch does the rest.

## 3. Use the components

```jsx
import { Button } from './design-system/components/core/Button.jsx';
import { EventCard } from './design-system/components/events/EventCard.jsx';
import { ModeSwitch } from './design-system/components/navigation/ModeSwitch.jsx';

<ModeSwitch mode={mode} onChange={setMode} />
<EventCard event={event} selected={event.id === selectedId} onOpenLink={open} />
<Button variant="primary" block>Open Event Link</Button>
```

Full inventory:

| Group | Components |
|---|---|
| `core/` | `Button`, `TextField`, `SectionLabel`, `StatBlock` |
| `events/` | `EventCard`, `PlatformBadge`, `FriendAvatarStack`, `LinkedInMentionCard` |
| `map/` | `MapPin` |
| `navigation/` | `ModeSwitch` |
| `surfaces/` | `BottomSheet` |

Each has a sibling `.d.ts` (props contract) and `.prompt.md` (one-paragraph "what
and when", a usage example, and the rules that matter). Read the `.prompt.md`
before changing a component — several encode real product rules, e.g. residential
pins must never plot an exact address.

### TypeScript

The `.jsx` files are untyped; the `.d.ts` files next to them carry the props
interfaces. If your project is strict TS, either rename the `.jsx` to `.tsx` and
inline the prop types from the `.d.ts`, or add:

```jsonc
// tsconfig.json
{ "compilerOptions": { "allowJs": true, "checkJs": false } }
```

## 4. Fonts

`tokens/fonts.css` is a single Google Fonts `@import`:

- **Fredoka** — `--font-display`. Sheet headers, card titles, stat numerals.
- **Plus Jakarta Sans** — `--font-ui`. Everything readable.

**Both are substitutions.** The LuMap app ships no font files, so these were chosen
to fit the pastel direction. If you self-host or license different faces, replace
the `@import` in `tokens/fonts.css` and update the two stacks in
`tokens/typography.css` — nothing else references a family name.

For Next.js, delete the `@import` and use `next/font` instead, assigning the CSS
variables `--font-display` and `--font-ui`.

## 5. What is NOT in here

- **No logo.** The upstream repo ships only the stock Expo template icon, so no
  mark was imported or drawn. Set the name in type: Fredoka 600, tight tracking,
  `Lu` in `var(--accent)`.
- **No icon set.** LuMap uses emoji (💼 🔥 🎉 🎫) as its closed glyph set, plus map
  pins drawn as geometry. If you need UI glyphs (close, chevron), add Lucide at 2px
  stroke with round caps — that's a documented substitution, not a LuMap choice.
- **No map.** `reference/lumap-app/MapCanvas.jsx` is a pastel placeholder. The real
  app renders Mapbox and needs `EXPO_PUBLIC_MAPBOX_TOKEN`. Swap in your real map
  layer; keep `MapPin` for the markers.
- **No data layer.** `reference/lumap-app/feedEvents.jsx` is mock data mirroring
  `src/data/mockFeedEvents.ts` upstream.

## 6. Reference build

Open `reference/lumap-app/index.html` in a browser to see the intended result:
map, WORK/PARTY switch, Live Radar sheet, Settings sheet. It is a **design
reference**, not production code — recreate its screens with your own routing,
state and data, using the components above.

## 7. Letting Cursor use this

`SKILL.md` carries Agent Skills front-matter. Point your assistant at this folder:

```md
<!-- AGENTS.md or .cursor/rules/lumap-design.md -->
When building any LuMap UI, read `src/design-system/DESIGN_GUIDE.md` first and use
the components in `src/design-system/components/`. Never hard-code a colour —
use the CSS custom properties from `src/design-system/tokens/`.
```

## Source

Built from <https://github.com/RobinKry/LuMap> (branch `main`). The visual
direction here is **light and pastel**; the shipped app is dark and neon
(`#0D0D12` / `#C0FF00` / `#0052FF`). Original values are preserved in
`tokens/colors.css` comments and in DESIGN_GUIDE.md → "Relationship to the shipped
app", so the dark palette can be restored by editing that one file.
