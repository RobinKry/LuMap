# LuMap

Expo / React Native app: öffentliche Luma-Events (+ LinkedIn-Overlaps) auf Apple Maps.

## Data pipeline (v1)

- **Luma Sync:** Edge Function `discover-luma-events` — Luma-Profil verknüpfen + Stadt/Interessen → öffentliche Events (ohne Einzel-URL-Upload)
- **LinkedIn:** Edge Function `import-linkedin-csv` — Connections/Invitations.csv (kein Scraping)
- **Overlaps:** SQL `refresh_event_overlaps` + Function `match-overlaps` (Name-Match)

Supabase tables: `events`, `event_guests`, `linkedin_contacts`, `event_overlaps`, `user_tracked_events`

## Setup

```bash
npm install
cp .env.example .env.local
# EXPO_PUBLIC_SUPABASE_* setzen
npx expo start
```

Beim Öffnen sync’t die App öffentliche Events über verknüpftes Luma-Profil + Interessen. In **Settings**: Profil-Link, Stadt, Interessen; optional LinkedIn-CSV.

iOS:

```bash
npx expo prebuild --platform ios
open ios/LuMap.xcworkspace
```

Bundle ID: `com.lumap.com` · Team: `3RS7CS256A`

## Xcode Cloud (wichtig)

Expo/CocoaPods brauchen den **Workspace**, nicht das nackte Xcode-Projekt.

1. [App Store Connect → LuMap → Xcode Cloud](https://appstoreconnect.apple.com/apps/6796983748/ci)
2. Workflow **Default** → **Edit Workflow** → **Environment**
3. **Xcode Project or Workspace** auf `ios/LuMap.xcworkspace` setzen (**nicht** `ios/LuMap.xcodeproj`)
4. Speichern → Build starten

`ios/ci_scripts` installieren npm/Pods und brechen ab, wenn ASC noch auf `.xcodeproj` zeigt (sonst `No such module 'Expo'`). Scripts können die ASC-Einstellung nicht überschreiben.
