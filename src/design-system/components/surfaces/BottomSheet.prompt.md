The frosted bottom panel that holds the Live Radar feed over the map.

```jsx
<BottomSheet title="Live Radar" subtitle={`${events.length} events · ${mode}`} height="62%">
  {events.map(e => <EventCard key={e.id} event={e} style={{marginBottom:'var(--gap-card)'}} />)}
</BottomSheet>
```

- Fill is `--surface-sheet` (86% white) over a backdrop blur — the map must stay faintly readable behind it.
- Header is set in `--font-display` at 22px; the count line stays in the UI face.
- Grab handle is 40×5 at `--lm-alpha-14`, always present.
- Snap heights on native are 18% / 42% / 78%; pick a matching value rather than inventing one.
- 16px horizontal gutter; 40px bottom padding so the last card clears the home indicator.
