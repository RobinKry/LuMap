Who you know at an event — up to four overlapping 32px avatars, then "+N others".

```jsx
<FriendAvatarStack friends={event.friends} extraCount={event.otherCount} />
```

- Overlap is exactly `--avatar-overlap` (-8px); each avatar carries a 2px white ring so the stack reads against the card.
- No avatar image → the first initial in Fredoka on a rotating pastel disc (lilac → mint → butter → peach). Never a generated illustration.
- Renders `null` when there is nothing to show; don't wrap it in an empty state.
