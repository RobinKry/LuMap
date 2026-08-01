# LuMap Design System

**LuMap** is a social map for finding the best tech and networking events — based on
where your friends and your network are actually going. It pulls public events from
**lu.ma**, **Partiful**, **LinkedIn** and **Eventbrite** onto a live heatmap, matches the
guest lists against your own LinkedIn connections, and shows you who you know
before you decide to go.

Its defining idea is a **dual personality**: one app, two modes.

| Mode | Accent | Canvas | What it surfaces |
|---|---|---|---|
| 💼 **WORK** *(default)* | Sky `#77A0F2` | Mist `#F3F5FF` | Luma + LinkedIn professional events |
| 🔥 **PARTY** | Lilac `#8B88F2` | Cream `#FFF7EE` | Social + residential events, locations deliberately blurred |

**WORK leads.** The product's primary job is professional — finding the tech and
networking events your network is going to. The app opens in WORK, WORK is the
left segment of the switch, and the unscoped `:root` tokens resolve to the WORK
palette. PARTY is a deliberate opt-in, one tap away, never the landing state.

Everything else in the interface — layout, type, spacing, radii — stays identical
across modes. Only the accent and the canvas temperature change. That restraint
*is* the brand: gen-Z energy carried by two pastels, a rounded display face and
four emoji, on a chassis that stays sober enough to open at work.

## Source

Built from the app codebase, read directly:

- **GitHub:** <https://github.com/RobinKry/LuMap> (branch `main`) — Expo / React Native, NativeWind, Mapbox, Supabase.
  - `src/context/AppModeContext.tsx` — the `MODE_THEMES` object: every colour in this system starts there
  - `src/components/` — `ModeSwitch`, `InteractiveHeatmap`, `LiveRadarFeed`, `LinkedInEventCard`, `SettingsPanel`
  - `src/data/mockFeedEvents.ts`, `src/types/index.ts` — the content model and real product copy
  - `supabase/` — the events / overlaps data pipeline
- Explore that repository further before building anything substantial: it is the
  only source of truth for this product, and it is small enough to read end to end.

No Figma file, brand guide, deck or font files were provided. Everything below is
derived from code, and where a decision had to be made beyond the code it is
flagged as such.

## Content fundamentals

**Bilingual, and unapologetically so.** The app ships German and English side by
side, often in the same card: `Live Radar` / `Einstellungen`, `128 dabei`,
`LinkedIn-Match`, `Open Event Link`, `Overlaps neu matchen`,
`Namens-Matches sind nicht verifiziert (Kollisionen möglich).` Product nouns
(Overlaps, Match, Live Radar, Event Link) stay English; instructions and system
feedback are German. Keep both — do not "clean it up" into one language.

**Voice.** Second person, direct, no marketing throat-clearing. Sentences are
short and instructional: `Öffentliche Event-URL einfügen.` ·
`Desktop LinkedIn → Settings → Data privacy → Get a copy of your data →
Connections → CSV hier hochladen. Kein Scraping.` Arrows do the work that a
paragraph would. There is no "we".

**Honest about limits.** The product tells you what it *doesn't* know, in the
same plain tone: `neighborhood (blurred)`, `Guest-List privat (keine Namen)`,
`Namens-Matches sind nicht verifiziert`. Privacy and accuracy caveats are copy,
not fine print — never delete them to tidy a layout.

**Casing.** Sentence case for everything readable. UPPERCASE only for the two
mode names (PARTY / WORK) and section labels, where CSS does the shouting.
Platform names stay lowercase — they're wordmarks: `lu.ma`, `partiful`,
`linkedin`, `eventbrite`. Counts are bare numerals over a tiny caption (`38` /
`dabei`), never "38 people attending".

**Emoji.** Yes — but as a closed, functional set, never decoration. `🔥` = PARTY,
`💼` = WORK / professional sources, `🎉` = partiful, `🎫` = eventbrite. Four
glyphs, fixed meanings. Do not add new ones.

**Status messages** are terse and factual, joined with `·`:
`1284 Kontakte importiert · 37 Overlaps` · `Event gespeichert · 64 Gäste · Overlaps 9`.

## Visual foundations

**Light, pastel, paper.** *(Direction change — see "Relationship to the shipped
app" below.)* The system sits on warm or cool paper, never night. `--surface-canvas`
is `#F3F5FF` mist in WORK (the default) and `#FFF7EE` cream in PARTY; cards are pure white.

**Colour is two pastel accents plus ink at N%.** `--accent` is Sky `#77A0F2`
(WORK, the default) or Lilac `#8B88F2` (PARTY). Four supporting pastels — mint, butter, peach and
a lighter lilac — appear only as *tints*: platform chips, avatar discs, the
LinkedIn block, map parks and water. They never carry text. Every stroke, chip
background and scrim is plum-black ink at an opacity (4–20%). Text is four steps
of the same ink. `--lm-linkedin` `#0A66C2` remains the one saturated exception,
and only on LinkedIn-sourced content.

**Contrast rule.** Labels on an accent are always `--accent-ink` (`#241E33`), never
white — the pastels are too light to carry white type. Test any new colour against
that rule before adding it.

**No gradients.** Depth comes from *soft ink shadows plus white*: cream canvas →
86%-white frosted sheet (backdrop blur 16px) → white card with `--shadow-card`.
Shadows are tinted plum, never black, and never above ~10% opacity. Blur appears
only where the map should stay faintly visible: the mode switch, the Settings
pill, the sheet. Never on a card.

**Type.** Two families. **Fredoka** (`--font-display`) at 500/600 with -0.02em
tracking carries sheet headers, card titles and stat numerals — it supplies the
playful half of the personality. **Plus Jakarta Sans** (`--font-ui`) carries
everything readable, at 400 body / 600 labels / 700 actions. Eight sizes:
10 · 11 · 12 · 14 · 16 · 18 · 22 · 30. `--tracking-wide` (0.04em) on uppercase
labels and platform chips. Both are Google Fonts substitutions — the app ships no
font files.

**Spacing.** Strict 4px scale, unchanged: 16px screen gutter, 16px card padding,
12px between cards, 12px inside the nested LinkedIn card, 16px between stat
blocks, 40px bottom padding so the last card clears the home indicator.

**Radii — nothing is square except the map.** 28px on event cards, 32px on the
sheet's top corners, 20px on inputs and nested cards, 16px on small tiles, and
**full-round on every button**. Buttons are pills, not rectangles; that single
choice does most of the playful work.

**Cards** = white fill + 28px radius + 16px padding + `--shadow-card`, with a
*transparent* 2px border. Selection swaps that border to `--accent` and lifts the
shadow to `--shadow-raised`. No gradient, no coloured left border, no outline.

**Imagery.** There is none. No photography, no illustration, no stock art — the
map is the image, and pastel blocks are the map. Avatars are the only pictures;
when missing they fall back to an initial in Fredoka on a rotating pastel disc
(lilac → mint → butter → peach). Do not add hero imagery or generated
illustrations to LuMap surfaces.

**Motion.** One signature: the mode-switch pill, a spring (`damping 18,
stiffness 220, mass 0.8`) travelling 118px, approximated as `--dur-spring` /
`--ease-spring`. Presses use `--ease-bounce` and scale to 0.96 — springy, not a
flat opacity dip. Everything else is a 220ms accent crossfade and a 320ms sheet
snap between 18% / 42% / 78%. No entrance animations, no parallax.

**States.** Press = scale to `--press-scale`. Disabled = 40% opacity. Focus on an
input = accent stroke plus a 4px `--accent-glow` ring. Hover doesn't exist on the
source platform; on web, reuse the press treatment rather than inventing one.

**Fixed chrome.** The mode switch and Settings pill float in the top safe area
over the map; the radar sheet is pinned to the bottom. The map itself never
scrolls under a header — it *is* the background.

## Relationship to the shipped app

This system deliberately diverges from `RobinKry/LuMap` on **surface treatment
only**. The shipped app is dark and neon: canvas `#0D0D12` / `#12161A`, accents
Electric Lime `#C0FF00` (PARTY) and Cobalt `#0052FF` (WORK), 4%-white card fills,
hairline strokes, no shadows, system UI type. Those values are preserved here in
`tokens/colors.css` comments and in `github.md` so the original can be restored.

**Unchanged from source:** the WORK / PARTY duality itself (the source launches in
PARTY; this system launches in WORK — a product decision, not a styling one), the mode-switch
spring, the 4px spacing scale, the emoji glyph set, the privacy-blur pin
behaviour, the component inventory, and all product copy.

## Iconography

**LuMap has no icon set.** No icon font, no SVG sprite, no PNG glyphs — the
repository's `assets/` folder contains only stock Expo template artwork. Icon
roles are carried by:

1. **Emoji**, the closed set above (🔥 💼 🎉 🎫) — used inline in labels and badges.
2. **Map pins drawn as pure geometry** (`MapPin`): an accent dot with a white ring
   and a soft halo for public events; a two-layer accent bloom with no core for
   residential ones. That bloom is the visual language of the privacy blur.
3. **Typographic marks** — `·` as a separator, `→` in instructions, `+N others`,
   `—` for a missing count.

If you need a UI glyph that genuinely doesn't exist here (a close X, a chevron),
use **Lucide** at 2px stroke with round caps via CDN — round caps match the pill
geometry. This is a substitution, flagged: LuMap has not chosen an icon
library.

**No logo exists.** `assets/icon.png` in the repo is the unmodified Expo starter
icon, so it was deliberately *not* imported and no mark has been drawn. Wherever a
logo would go, set the name in type: **LuMap**, Fredoka 600, tight tracking, with
`Lu` in `--accent`. See the Brand → Wordmark card.

## Files

```
styles.css              single entry point — @imports only
tokens/                 fonts · colors · typography · spacing · shape · motion
components/             core · events · map · navigation · surfaces
guidelines/             19 foundation specimen cards (Colors, Type, Spacing, Shape, Motion, Brand)
ui_kits/lumap-app/      click-through recreation of the mobile app
assets/                 (empty — no usable brand assets exist upstream)
github.md               source repo + sync record
SKILL.md                Agent Skills entry point
```

## Components

Grouped by concern; every one has a `.d.ts` props contract and a `.prompt.md`
usage note beside it.

- **core/** — `Button` (pill; primary / soft / ghost / chrome / linkedin), `TextField`, `SectionLabel`, `StatBlock`
- **events/** — `EventCard`, `PlatformBadge`, `FriendAvatarStack`, `LinkedInMentionCard`
- **map/** — `MapPin`
- **navigation/** — `ModeSwitch`
- **surfaces/** — `BottomSheet`

Every family here exists in the source. **Intentional additions:** `Button`,
`TextField`, `SectionLabel` and `StatBlock` are not standalone files upstream —
they are the four styling patterns repeated inline across `SettingsPanel.tsx` and
`LiveRadarFeed.tsx`, extracted so consumers stop re-deriving them. `MapPin` is a
DOM recreation of the Mapbox `CircleLayer` stack in `InteractiveHeatmap.tsx`. No
component was invented: there is no Toast, Tabs, Avatar, Tooltip or Dialog in this
system because there is none in the product.

## UI kits

- **`ui_kits/lumap-app/`** — the mobile app: map home with live pins, PARTY/WORK
  switching, the Live Radar sheet, and the Settings sheet with working (faked)
  CSV import and Luma sync. See its README for what is deliberately absent.

## Open questions

1. **Fonts — flagged substitution.** The app ships no font files, so the pastel
   direction borrows **Fredoka** (display) and **Plus Jakarta Sans** (UI) from
   Google Fonts. Send real licensed files and I'll swap them in; the two tokens
   are already separated.
2. **Logo.** None exists. Send a mark and it replaces the wordmark treatment.
3. **Mapbox.** The UI kit's map is a placeholder; a token or exported style would
   make the recreation exact.
