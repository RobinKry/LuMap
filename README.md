# LuMap

Expo / React Native app: öffentliche Luma-Events (+ LinkedIn-Overlaps) auf einer Mapbox-Karte.

## Data pipeline (v1)

- **Luma Discover:** Edge Function `discover-luma-events` — öffentliche Events (z. B. Berlin), auch ohne Anmeldung
- **Luma Detail:** Edge Function `fetch-luma-event` — Event-Metadaten + Guest-Namen nur wenn die Liste öffentlich ist
- **LinkedIn:** Edge Function `import-linkedin-csv` — Connections/Invitations.csv (kein Scraping)
- **Overlaps:** SQL `refresh_event_overlaps` + Function `match-overlaps` (Name-Match)

Supabase tables: `events`, `event_guests`, `linkedin_contacts`, `event_overlaps`, `user_tracked_events`

## Setup

```bash
npm install
cp .env.example .env.local
# EXPO_PUBLIC_SUPABASE_* + EXPO_PUBLIC_MAPBOX_TOKEN setzen
npx expo start
```

Beim Öffnen lädt die App öffentliche Berlin-Events. Optional in **Settings**: LinkedIn-CSV + einzelne Luma-URL.

iOS:

```bash
npx expo prebuild --platform ios
open ios/LuMap.xcworkspace
```

Bundle ID: `com.lumap.com` · Team: `3RS7CS256A`
