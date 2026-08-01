The LuMap pressable — always a full-round pill.

```jsx
<Button variant="primary" size="md" block>Open Event Link</Button>
<Button variant="soft" size="sm">Maybe</Button>
<Button variant="ghost" block>Overlaps neu matchen</Button>
<Button variant="chrome" size="sm">Settings</Button>
<Button variant="linkedin" size="sm">View original post</Button>
```

- `primary` fills with `--accent`; its label is always `--accent-ink` (plum-black), so it stays readable on both pastels. Never hard-code the label colour.
- `soft` uses `--accent-soft` for a second action that shouldn't compete.
- `chrome` is the only variant with a backdrop blur; use it only over the map.
- Press feedback is a scale-down to `--press-scale` on `--ease-bounce` — springy, not a flat opacity dip.
