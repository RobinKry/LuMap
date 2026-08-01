LuMap's identity control — a 2-up blurred pill that switches the entire app between WORK and PARTY.

```jsx
<div data-mode={mode.toLowerCase()}>
  <ModeSwitch mode={mode} onChange={setMode} />
</div>
```

- Each segment is exactly `--segment-width` (118px); the accent pill slides with the spring easing, never a linear fade.
- WORK sits first and is the default: LuMap opens in professional mode, and PARTY is the deliberate opt-in.
- The emoji are part of the labels (💼 / 🔥) — keep them.
- Native fires a heavy haptic on change; on web, let the accent crossfade carry it.
- It floats over the map, centred, in the top safe area. Don't nest it in a card.
