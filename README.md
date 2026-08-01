# LuMap

Luma-Events auf einer Karte, mit Überschneidungen zu eigenen Past-Events und LinkedIn-Kontakten.

## Projekte

| Pfad | Plattform |
|------|-----------|
| `/` (Root) | Web-Prototype (Vite + React) |
| `ios/` | **iOS-App** (SwiftUI + MapKit) – Apple Developer Team `3RS7CS256A` |

### Tabs (beide Clients)

- **Liste** – Event-Liste mit Teilnehmer-/Overlap-Stats
- **Karte** (Default) – Karte mit Markern
- **Einstellungen** – Verbindungen (Platzhalter)

## iOS

```bash
cd ios
xcodegen generate   # falls project.yml geändert wurde
open LuMap.xcodeproj
```

- Bundle ID: `com.lumap.app.lumap`
- Team: Robin Kryszak (`3RS7CS256A`)
- Deployment Target: iOS 17+

In Xcode einmal auf einem echten Gerät / mit Automatic Signing bauen, damit die App-ID im Apple Developer Portal angelegt wird. Danach in [App Store Connect](https://appstoreconnect.apple.com) eine neue App mit derselben Bundle-ID anlegen.

## Web (Prototype)

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Supabase

Projekt: `LuMap` (Region `eu-west-1`). Schema und Sync kommen später.
