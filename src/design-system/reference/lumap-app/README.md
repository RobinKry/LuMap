# LuMap app — UI kit

A click-through recreation of the only surface the product currently has: the
Expo / React Native app (`App.tsx` → `HomeScreen`).

**Screens**
| File | Recreates |
|---|---|
| `MapHome.jsx` | `App.tsx` HomeScreen — map, floating Settings pill, `ModeSwitch`, `LiveRadarFeed` |
| `SettingsScreen.jsx` | `src/components/SettingsPanel.tsx`, presented as a page sheet |
| `MapCanvas.jsx` | Stand-in for the Mapbox `MapView` (see caveat) |
| `feedEvents.jsx` | `src/data/mockFeedEvents.ts`, extended with the enriched DB fields |

**What you can do in `index.html`**
- Opens in 💼 WORK. Toggle to 🔥 PARTY — accents, canvas, sheet fill and the visible feed all swap.
- Tap a map pin or a card to select it (the card's stroke goes accent, matching `selectedEventId`).
- Open Settings → upload a fake `Connections.csv`, sync a Luma URL, re-match overlaps; each returns the app's real status string.
- Cycle the sheet between the app's three snap points with the ↕ button.

**Caveat — the map.** The real app renders Mapbox (`dark-v11` in PARTY,
`navigation-night-v1` in WORK) and needs `EXPO_PUBLIC_MAPBOX_TOKEN`. No token is
available here, so `MapCanvas.jsx` draws an abstract dark street field at the same
value range. It is a placeholder, not brand artwork — swap in a real Mapbox
render before using this for anything client-facing.

**Not recreated** because the source has no such screen: onboarding, auth (the
app calls `ensureSession()` silently), an event detail view, and friends
management. Selecting an event only highlights its card upstream too.
