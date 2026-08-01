Attribution block nested inside an event card when the event came from a LinkedIn post.

```jsx
<LinkedInMentionCard authorName="Sara Klein" authorHeadline="Partner @ Green Ventures" onOpen={open} />
```

- Sits on a `--lm-sky-100` tint with no border — the only nested surface that isn't white.
- `--lm-linkedin` (#0A66C2) is allowed here and nowhere else; it's a source colour, not a brand accent.
- Always nested inside `EventCard`, never standalone.
