# LuMap

Expo / React Native app: Luma + LinkedIn events on a Mapbox map, with **PARTY** and **WORK** modes.

> Dein „Network“-Modus entspricht hier dem **PARTY**-Modus aus dem Spec (🔥 PARTY / 💼 WORK).

## Modes

| Mode | Accent | Map style | Focus |
|------|--------|-----------|--------|
| PARTY | Electric Lime `#C0FF00` | `dark-v11` | Social / residential (blurred) |
| WORK | Cobalt `#0052FF` | `navigation-night-v1` | Luma + LinkedIn professional |

## Stack

- Expo 57 + React Native
- NativeWind + Reanimated
- Mapbox (`@rnmapbox/maps`)
- Supabase (`EXPO_PUBLIC_*` + AsyncStorage auth)
- Bottom sheet radar feed (`@gorhom/bottom-sheet`)

## Setup

```bash
npm install
cp .env.example .env.local
# EXPO_PUBLIC_SUPABASE_* + EXPO_PUBLIC_MAPBOX_TOKEN setzen
npx expo start
```

iOS native project (for Xcode / Xcode Cloud):

```bash
npx expo prebuild --platform ios
open ios/LuMap.xcworkspace
```

Bundle ID: `com.lumap.com` · Team: `3RS7CS256A`

## Data sources (v1)

Primary: **Luma** + **LinkedIn**. Partiful / Eventbrite types + parsers are scaffolded for later.
