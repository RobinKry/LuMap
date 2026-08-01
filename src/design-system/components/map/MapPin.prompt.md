Recreates the Mapbox `CircleLayer` pins from `InteractiveHeatmap.tsx`, restyled for the pastel map.

```jsx
<MapPin kind="public" selected />
<MapPin kind="residential" />
```

- `public`: 14px accent core, 3px white ring, a soft drop shadow, and a 32px `--accent-soft` halo. Selected adds an 8px accent glow.
- `residential`: two accent blooms, **no core and no ring** — a house party is a neighbourhood, not an address. Only PARTY mode produces these.
- Both take their colour from `--accent`, so they turn sky blue in WORK mode.
