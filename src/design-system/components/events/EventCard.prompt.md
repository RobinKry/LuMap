The core object of the product — one event in the Live Radar feed.

```jsx
<EventCard event={event} selected={event.id === selectedId} onSelect={...} onOpenLink={...} />
```

- White card, 28px radius (`--radius-xl`), soft ink shadow, no default border. Selection swaps the transparent 2px border to `--accent` and lifts the shadow to `--shadow-raised`.
- Titles set in `--font-display` (Fredoka) at 18px; everything else stays in the UI face.
- Order is fixed: badge row → title → venue → stats → match preview → friends → (LinkedIn block) → CTA.
- Residential PARTY events get the "neighborhood (blurred)" chip; never show a precise address for one.
- Stack cards with `--gap-card` (12px) inside the sheet's 16px gutter.
