# LuMap

Mobile-first Web-App: Luma-Events auf einer Karte, mit Überschneidungen zu eigenen Past-Events und LinkedIn-Kontakten.

## Tabs

- **Liste** (links) – Event-Liste mit Teilnehmer-/Overlap-Stats
- **Karte** (Mitte, Default) – Leaflet-Karte mit Markern
- **Einstellungen** (rechts) – Verbindungen (Platzhalter)

## Stack

- Vite + React + TypeScript
- React Router
- Leaflet / react-leaflet
- Supabase (`@supabase/supabase-js`)

## Setup

```bash
npm install
cp .env.example .env.local
# Werte aus dem Supabase-Dashboard eintragen
npm run dev
```

## Supabase

Projekt: `LuMap` (Region `eu-west-1`). Schema und Sync kommen später.
