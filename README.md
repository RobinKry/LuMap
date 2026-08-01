# LuMap

Expo / React Native app: Luma + LinkedIn events on a Mapbox map, with **PARTY** and **WORK** modes.

> Dein „Network“-Modus entspricht hier dem **PARTY**-Modus aus dem Spec (🔥 PARTY / 💼 WORK).

## Modes

| Mode | Accent | Map style | Focus |
|------|--------|-----------|--------|
| PARTY | Electric Lime `#C0FF00` | `dark-v11` | Social / residential (blurred) |
| WORK | Cobalt `#0052FF` | `navigation-night-v1` | Luma + LinkedIn professional |

## Data pipeline (v1)

- **Luma:** Edge Function `fetch-luma-event` — öffentliche Event-Metadaten + Guest-Namen nur wenn die Liste öffentlich ist
- **LinkedIn:** Edge Function `import-linkedin-csv` — offizieller Connections.csv-Upload (kein Scraping)
- **Overlaps:** SQL `refresh_event_overlaps` + Function `match-overlaps` (Name-Match)

Supabase tables: `events`, `event_guests`, `linkedin_contacts`, `event_overlaps`, `user_tracked_events`

## Setup

```bash
npm install
cp .env.example .env.local
# EXPO_PUBLIC_SUPABASE_* + EXPO_PUBLIC_MAPBOX_TOKEN setzen
npx expo start
```

In der App: **Settings** → LinkedIn-CSV hochladen + Luma-URL syncen.

iOS:

```bash
npx expo prebuild --platform ios
open ios/LuMap.xcworkspace
```

Bundle ID: `com.lumap.com` · Team: `3RS7CS256A`
