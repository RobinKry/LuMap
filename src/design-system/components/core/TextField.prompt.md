Single-line input on white with a soft shadow; focus adds an accent stroke and a 4px accent glow ring.

```jsx
<TextField value={url} onChange={e => setUrl(e.target.value)} placeholder="https://lu.ma/..." />
```

Always pair with a `SectionLabel` above and a `--text-secondary` explainer line — that is the Settings pattern.
