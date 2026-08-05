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

### TestFlight / App Store Connect Upload (Pflicht)

Ein grüner **Archive**-Build erscheint **nicht** automatisch unter TestFlight. Der Workflow muss die IPA für ASC vorbereiten **und** hochladen:

1. [Xcode Cloud → Workflow Default → Edit Workflow](https://appstoreconnect.apple.com/apps/6796983748/ci)
2. Unter **Actions** → **Archive - iOS** öffnen
3. **Deployment Preparation** auf **TestFlight and App Store** setzen (oder **TestFlight (Internal Testing Only)** nur für internes Team)
4. Unter **Post-Actions** auf **+** → **TestFlight Internal Testing** (lädt den Build nach App Store Connect / TestFlight; optional eine interne Tester-Gruppe wählen)
5. **Save** → **Start Build** (oder nächsten Push abwarten)

Danach unter [TestFlight → iOS Builds](https://appstoreconnect.apple.com/apps/6796983748/testflight/ios) prüfen. Status oft zuerst **Processing** (meist Minuten, manchmal 15–60 Min). Export Compliance ist im Repo mit `ITSAppUsesNonExemptEncryption = false` gesetzt.

Zusätzlich bettet `ios/ci_scripts/embed_pods_in_xcodeproj.rb` nach jedem `pod install` `Pods/Pods.xcodeproj` in `LuMap.xcodeproj` ein (Target-Dependency `LuMap` → `Pods-LuMap`), damit Archive auch mit `-project` die Pods baut — Fallback, falls ASC noch auf `.xcodeproj` zeigt oder absolute `xcodebuild`-Pfade Shims umgehen.

Lokal nach `pod install` einmal:

```bash
ruby ios/ci_scripts/embed_pods_in_xcodeproj.rb
```
