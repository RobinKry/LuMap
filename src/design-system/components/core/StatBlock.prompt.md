A counter inside an event card — 16px semibold value over a 10px 45%-white caption.

```jsx
<div style={{display:'flex',gap:'var(--gap-stat)'}}>
  <StatBlock value={42} label="dabei" />
  <StatBlock value={7} label="LinkedIn-Match" />
</div>
```

Never more than two per card. A missing value renders `—`, not `0`.
